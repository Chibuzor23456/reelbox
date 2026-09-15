<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/HttpClient.php';
require_once __DIR__ . '/IngestionState.php';
require_once __DIR__ . '/vod/InternetArchiveAdapter.php';

const VOD_JOB_NAME = 'vod_catalogue';

/**
 * Registry of VOD source adapters. Each entry is a discover/resolve pair
 * plus the underlying provider name:
 *   discover(): array<candidate>  — cheap, one call, opaque candidates
 *   resolve(candidate): ?array    — normalized movie/series shape, or null to skip
 *
 * Adding a source — a second movie provider, a dedicated series-capable
 * catalogue API — means writing one adapter file and adding one line here.
 * Nothing else in this file changes, and the DB layer (vod_upsert_movie /
 * vod_upsert_series below) has no idea which adapter produced an item.
 */
function vod_adapters(): array
{
    return [
        'ia_movies' => ['discover' => 'ia_movies_discover', 'resolve' => 'ia_movies_resolve', 'provider' => 'internet_archive'],
        'ia_series' => ['discover' => 'ia_series_discover', 'resolve' => 'ia_series_resolve', 'provider' => 'internet_archive'],
    ];
}

function vod_cache_path(): string
{
    return __DIR__ . '/../storage/cache/vod-candidates.json';
}

function vod_search_and_cache(): int
{
    $all = [];
    foreach (vod_adapters() as $adapterKey => $adapter) {
        foreach (call_user_func($adapter['discover']) as $candidate) {
            $candidate['__adapter'] = $adapterKey;
            $all[] = $candidate;
        }
    }

    $dir = dirname(vod_cache_path());
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException("Could not create cache directory: $dir");
    }
    file_put_contents(vod_cache_path(), json_encode($all));

    return count($all);
}

function vod_source_id_for(string $provider): string
{
    static $cache = [];
    if (isset($cache[$provider])) {
        return $cache[$provider];
    }

    $stmt = db()->prepare('SELECT id FROM vod_sources WHERE provider = ? LIMIT 1');
    $stmt->execute([$provider]);
    $id = $stmt->fetchColumn();

    if (!$id) {
        db()->prepare('INSERT INTO vod_sources (id, name, provider, enabled) VALUES (UUID(), ?, ?, 1)')
            ->execute([ucwords(str_replace('_', ' ', $provider)), $provider]);
        $stmt->execute([$provider]);
        $id = $stmt->fetchColumn();
    }

    $cache[$provider] = $id;
    return $id;
}

// -----------------------------------------------------------------------
// TMDB enrichment — optional. Adds posters/backdrops/synopsis/genre on top
// of whatever the source adapter already provided; skipped entirely (not
// an error) when TMDB_API_KEY isn't configured.
// -----------------------------------------------------------------------

function vod_tmdb_search(string $endpoint, string $title, ?int $year): ?array
{
    $apiKey = env('TMDB_API_KEY');
    if (!$apiKey) {
        return null;
    }

    $params = ['api_key' => $apiKey, 'query' => $title];
    if ($year) {
        $params[$endpoint === 'tv' ? 'first_air_date_year' : 'year'] = $year;
    }

    $result = http_get_json("https://api.themoviedb.org/3/search/$endpoint?" . http_build_query($params));
    return $result['results'][0] ?? null;
}

function vod_tmdb_image(?string $path, string $size): ?string
{
    return $path ? "https://image.tmdb.org/t/p/$size$path" : null;
}

function vod_tmdb_genre_name(?int $genreId): ?string
{
    static $genres = [
        28 => 'Action', 12 => 'Adventure', 16 => 'Animation', 35 => 'Comedy',
        80 => 'Crime', 99 => 'Documentary', 18 => 'Drama', 10751 => 'Family',
        14 => 'Fantasy', 36 => 'History', 27 => 'Horror', 10402 => 'Music',
        9648 => 'Mystery', 10749 => 'Romance', 878 => 'Science Fiction',
        10770 => 'TV Movie', 53 => 'Thriller', 10752 => 'War', 37 => 'Western',
        10759 => 'Action & Adventure', 10762 => 'Kids', 10763 => 'News',
        10764 => 'Reality', 10765 => 'Sci-Fi & Fantasy', 10766 => 'Soap',
        10767 => 'Talk', 10768 => 'War & Politics',
    ];

    return $genreId !== null ? ($genres[$genreId] ?? null) : null;
}

// -----------------------------------------------------------------------
// DB writes — provider-agnostic. These only know the normalized shape
// adapters produce, never which adapter produced it.
// -----------------------------------------------------------------------

function vod_upsert_movie(string $sourceId, array $item): void
{
    $tmdb = vod_tmdb_search('movie', $item['title'], $item['year']);

    $stmt = db()->prepare(
        'INSERT INTO vod_items
            (id, vod_source_id, type, title, synopsis, poster_url, backdrop_url, year, genre,
             runtime_minutes, source_identifier, playback_url, tmdb_id, status, created_at, updated_at)
         VALUES
            (UUID(), :source_id, \'movie\', :title, :synopsis, :poster_url, :backdrop_url, :year, :genre,
             :runtime_minutes, :source_identifier, :playback_url, :tmdb_id, \'active\', NOW(), NOW())
         ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            synopsis = VALUES(synopsis),
            poster_url = VALUES(poster_url),
            backdrop_url = VALUES(backdrop_url),
            year = VALUES(year),
            genre = VALUES(genre),
            runtime_minutes = VALUES(runtime_minutes),
            playback_url = VALUES(playback_url),
            tmdb_id = VALUES(tmdb_id),
            updated_at = NOW()'
    );

    $stmt->execute([
        ':source_id' => $sourceId,
        ':title' => $item['title'],
        ':synopsis' => $tmdb['overview'] ?? $item['synopsis'],
        ':poster_url' => vod_tmdb_image($tmdb['poster_path'] ?? null, 'w500') ?? ($item['thumbnail_url'] ?? null),
        ':backdrop_url' => vod_tmdb_image($tmdb['backdrop_path'] ?? null, 'original') ?? ($item['thumbnail_url'] ?? null),
        ':year' => $item['year'],
        ':genre' => vod_tmdb_genre_name($tmdb['genre_ids'][0] ?? null),
        ':runtime_minutes' => $item['runtime_minutes'],
        ':source_identifier' => $item['source_identifier'],
        ':playback_url' => $item['playback_url'],
        ':tmdb_id' => isset($tmdb['id']) ? (string) $tmdb['id'] : null,
    ]);
}

function vod_upsert_series(string $sourceId, array $item): void
{
    $tmdb = vod_tmdb_search('tv', $item['title'], $item['year']);

    $db = db();
    $db->beginTransaction();

    try {
        $stmt = $db->prepare(
            'INSERT INTO vod_items
                (id, vod_source_id, type, title, synopsis, poster_url, backdrop_url, year, genre,
                 source_identifier, status, created_at, updated_at)
             VALUES
                (UUID(), :source_id, \'series\', :title, :synopsis, :poster_url, :backdrop_url, :year, :genre,
                 :source_identifier, \'active\', NOW(), NOW())
             ON DUPLICATE KEY UPDATE
                title = VALUES(title),
                synopsis = VALUES(synopsis),
                poster_url = VALUES(poster_url),
                backdrop_url = VALUES(backdrop_url),
                genre = VALUES(genre),
                updated_at = NOW()'
        );
        $stmt->execute([
            ':source_id' => $sourceId,
            ':title' => $item['title'],
            ':synopsis' => $tmdb['overview'] ?? $item['synopsis'],
            ':poster_url' => vod_tmdb_image($tmdb['poster_path'] ?? null, 'w500') ?? ($item['thumbnail_url'] ?? null),
            ':backdrop_url' => vod_tmdb_image($tmdb['backdrop_path'] ?? null, 'original') ?? ($item['thumbnail_url'] ?? null),
            ':year' => $item['year'],
            ':genre' => vod_tmdb_genre_name($tmdb['genre_ids'][0] ?? null),
            ':source_identifier' => $item['source_identifier'],
        ]);

        $vodItemId = $db->prepare('SELECT id FROM vod_items WHERE vod_source_id = ? AND source_identifier = ?');
        $vodItemId->execute([$sourceId, $item['source_identifier']]);
        $vodItemId = $vodItemId->fetchColumn();

        foreach ($item['seasons'] as $season) {
            $seasonStmt = $db->prepare(
                'INSERT INTO vod_seasons (id, vod_item_id, season_number, created_at, updated_at)
                 VALUES (UUID(), ?, ?, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE updated_at = NOW()'
            );
            $seasonStmt->execute([$vodItemId, $season['season_number']]);

            $seasonId = $db->prepare('SELECT id FROM vod_seasons WHERE vod_item_id = ? AND season_number = ?');
            $seasonId->execute([$vodItemId, $season['season_number']]);
            $seasonId = $seasonId->fetchColumn();

            $episodeStmt = $db->prepare(
                'INSERT INTO vod_episodes
                    (id, vod_season_id, episode_number, title, synopsis, duration_minutes, playback_url, created_at, updated_at)
                 VALUES
                    (UUID(), :season_id, :episode_number, :title, :synopsis, :duration_minutes, :playback_url, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    synopsis = VALUES(synopsis),
                    duration_minutes = VALUES(duration_minutes),
                    playback_url = VALUES(playback_url),
                    updated_at = NOW()'
            );

            foreach ($season['episodes'] as $episode) {
                $episodeStmt->execute([
                    ':season_id' => $seasonId,
                    ':episode_number' => $episode['episode_number'],
                    ':title' => $episode['title'],
                    ':synopsis' => $episode['synopsis'],
                    ':duration_minutes' => $episode['duration_minutes'],
                    ':playback_url' => $episode['playback_url'],
                ]);
            }
        }

        $db->commit();
    } catch (Throwable $e) {
        $db->rollBack();
        throw $e;
    }
}

// -----------------------------------------------------------------------
// Orchestrator
// -----------------------------------------------------------------------

function vod_process_batch(int $batchSize): array
{
    $refreshIntervalHours = (int) env('VOD_REFRESH_INTERVAL_HOURS', '24');

    return run_cached_batch_job(
        VOD_JOB_NAME,
        $batchSize,
        $refreshIntervalHours,
        vod_cache_path(),
        'vod_search_and_cache',
        function (array $batch): int {
            $adapters = vod_adapters();
            $ingested = 0;

            foreach ($batch as $candidate) {
                $adapter = $adapters[$candidate['__adapter'] ?? ''] ?? null;
                if ($adapter === null) {
                    continue;
                }

                $resolved = call_user_func($adapter['resolve'], $candidate);
                if ($resolved === null) {
                    continue;
                }

                $sourceId = vod_source_id_for($adapter['provider']);

                if ($resolved['type'] === 'movie') {
                    vod_upsert_movie($sourceId, $resolved);
                } elseif ($resolved['type'] === 'series') {
                    vod_upsert_series($sourceId, $resolved);
                }

                $ingested++;
            }

            return $ingested;
        },
    );
}

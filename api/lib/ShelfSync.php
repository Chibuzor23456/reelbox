<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/M3uParser.php';
require_once __DIR__ . '/PlaylistIngestor.php';

/**
 * Curated Home-page shelves, sourced from IPTV-org's own region/category
 * playlists rather than inferred from our own category/country parsing —
 * these are hand-curated by IPTV-org and more reliable than guessing from
 * a channel's group-title.
 */
function shelf_definitions(): array
{
    return [
        'nigeria' => 'https://iptv-org.github.io/iptv/countries/ng.m3u',
        'africa' => 'https://iptv-org.github.io/iptv/regions/afr.m3u',
        'sports' => 'https://iptv-org.github.io/iptv/categories/sports.m3u',
        'movies' => 'https://iptv-org.github.io/iptv/categories/movies.m3u',
        'news' => 'https://iptv-org.github.io/iptv/categories/news.m3u',
        'series' => 'https://iptv-org.github.io/iptv/categories/series.m3u',
        'entertainment' => 'https://iptv-org.github.io/iptv/categories/entertainment.m3u',
    ];
}

/**
 * Fetches one curated IPTV-org playlist and upserts every entry as a real
 * channel row (same upsert_channel() the main index.m3u ingestion uses),
 * then tags all of them into this shelf.
 *
 * These category/region playlists are IPTV-org's own curated, much smaller
 * subsets (hundreds of entries, not 11,000+) — upserting them directly means
 * Sports/News/Movies/Series/Entertainment/Nigeria/Africa get their full,
 * real channel counts immediately, instead of waiting on however far the
 * chunked master index.m3u ingestion has crawled. The master ingestion
 * still owns the full catalogue long-term; this just doesn't make these
 * curated shelves hostage to its progress.
 */
function shelf_sync(string $shelfKey, string $url): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'ReelBoxIngestor/1.0',
    ]);
    $body = curl_exec($ch);
    $ok = curl_errno($ch) === 0;
    curl_close($ch);

    if (!$ok || $body === false) {
        throw new RuntimeException("Failed to fetch shelf playlist: $shelfKey");
    }

    $entries = m3u_parse($body);
    $hashes = array_values(array_unique(array_map(
        static fn (array $e) => hash('sha256', $e['stream_url']),
        $entries
    )));

    $db = db();
    $db->beginTransaction();

    try {
        foreach ($entries as $entry) {
            upsert_channel($entry);
        }

        $db->prepare('DELETE FROM channel_shelves WHERE shelf_key = ?')->execute([$shelfKey]);

        $matched = 0;
        if ($hashes !== []) {
            $placeholders = implode(',', array_fill(0, count($hashes), '?'));
            $stmt = $db->prepare("SELECT id FROM channels WHERE stream_url_hash IN ($placeholders)");
            $stmt->execute($hashes);
            $channelIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

            $insert = $db->prepare('INSERT IGNORE INTO channel_shelves (shelf_key, channel_id) VALUES (?, ?)');
            foreach ($channelIds as $channelId) {
                $insert->execute([$shelfKey, $channelId]);
            }
            $matched = count($channelIds);
        }

        $db->commit();
    } catch (Throwable $e) {
        $db->rollBack();
        throw $e;
    }

    return ['shelf' => $shelfKey, 'matched' => $matched, 'playlist_total' => count($entries)];
}

function shelf_sync_all(): array
{
    $results = [];
    foreach (shelf_definitions() as $key => $url) {
        try {
            $results[] = shelf_sync($key, $url);
        } catch (Throwable $e) {
            $results[] = ['shelf' => $key, 'error' => $e->getMessage()];
        }
    }

    return $results;
}

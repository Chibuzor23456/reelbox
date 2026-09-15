<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/M3uParser.php';
require_once __DIR__ . '/IngestionState.php';

const PLAYLIST_JOB_NAME = 'live_playlist';

function playlist_cache_path(): string
{
    return __DIR__ . '/../storage/cache/playlist.json';
}

/**
 * Fetches the playlist, parses it, and writes the normalized entries to a
 * local cache file. This is the only step that touches the network — the
 * expensive part (thousands of DB upserts) happens in bounded batches
 * afterwards, read straight from this cache.
 */
function playlist_fetch_and_cache(string $url): int
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_USERAGENT => 'ReelBoxIngestor/1.0',
    ]);
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($errno !== 0 || $body === false) {
        throw new RuntimeException("Failed to fetch playlist: $error");
    }

    $channels = m3u_parse($body);

    $dir = dirname(playlist_cache_path());
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException("Could not create cache directory: $dir");
    }

    file_put_contents(playlist_cache_path(), json_encode($channels));

    return count($channels);
}

function channel_playback_mode(string $streamUrl, ?string $userAgent, ?string $referrer): string
{
    if (str_starts_with($streamUrl, 'http://')) {
        return 'relay';
    }

    if ($userAgent !== null || $referrer !== null) {
        return 'relay';
    }

    return 'direct';
}

function upsert_channel(array $channel): void
{
    $streamUrl = $channel['stream_url'];
    $hash = hash('sha256', $streamUrl);
    $mode = channel_playback_mode(
        $streamUrl,
        $channel['required_user_agent'] ?? null,
        $channel['required_referrer'] ?? null,
    );

    // status is deliberately excluded from the UPDATE clause — re-ingestion
    // must not silently re-enable a channel an admin disabled, or override
    // the health-check job's verdict.
    $stmt = db()->prepare(
        'INSERT INTO channels
            (id, tvg_id, name, logo_url, country, category, stream_url, stream_url_hash,
             required_user_agent, required_referrer, playback_mode, status, created_at, updated_at)
         VALUES
            (UUID(), :tvg_id, :name, :logo_url, :country, :category, :stream_url, :stream_url_hash,
             :required_user_agent, :required_referrer, :playback_mode, \'active\', NOW(), NOW())
         ON DUPLICATE KEY UPDATE
            tvg_id = VALUES(tvg_id),
            name = VALUES(name),
            logo_url = VALUES(logo_url),
            country = VALUES(country),
            category = VALUES(category),
            required_user_agent = VALUES(required_user_agent),
            required_referrer = VALUES(required_referrer),
            playback_mode = VALUES(playback_mode),
            updated_at = NOW()'
    );

    $stmt->execute([
        ':tvg_id' => $channel['tvg_id'],
        ':name' => $channel['name'],
        ':logo_url' => $channel['logo_url'],
        ':country' => $channel['country'],
        ':category' => $channel['category'],
        ':stream_url' => $streamUrl,
        ':stream_url_hash' => $hash,
        ':required_user_agent' => $channel['required_user_agent'] ?? null,
        ':required_referrer' => $channel['required_referrer'] ?? null,
        ':playback_mode' => $mode,
    ]);
}

/**
 * Processes one bounded batch of the playlist ingestion job. Safe to call
 * repeatedly from a cron trigger every few minutes.
 */
function playlist_process_batch(int $batchSize): array
{
    $playlistUrl = env('IPTV_PLAYLIST_URL', 'https://iptv-org.github.io/iptv/index.m3u');
    $refreshIntervalHours = (int) env('PLAYLIST_REFRESH_INTERVAL_HOURS', '12');

    return run_cached_batch_job(
        PLAYLIST_JOB_NAME,
        $batchSize,
        $refreshIntervalHours,
        playlist_cache_path(),
        fn () => playlist_fetch_and_cache($playlistUrl),
        function (array $batch): int {
            foreach ($batch as $entry) {
                upsert_channel($entry);
            }
            return count($batch);
        },
    );
}

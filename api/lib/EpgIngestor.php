<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/IngestionState.php';

const EPG_JOB_NAME = 'epg_guide';

function epg_cache_path(): string
{
    return __DIR__ . '/../storage/cache/epg.json';
}

/**
 * Fetches the configured XMLTV source (gzip or plain XML), streams it with
 * XMLReader rather than loading a DOM (this source is tiny today, but nothing
 * here assumes that stays true), and writes a flat array of programme
 * records to the cache file for batched upserting afterwards.
 */
function epg_fetch_and_cache(string $url): int
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 60,
        CURLOPT_USERAGENT => 'ReelBoxIngestor/1.0',
    ]);
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($errno !== 0 || $body === false) {
        throw new RuntimeException("Failed to fetch EPG source: $error");
    }

    $isGzip = strlen($body) >= 2 && substr($body, 0, 2) === "\x1f\x8b";
    $xml = $isGzip ? @gzdecode($body) : $body;
    if ($xml === false || $xml === null) {
        throw new RuntimeException('Failed to decompress EPG source.');
    }

    $programmes = epg_parse_xmltv($xml);

    $dir = dirname(epg_cache_path());
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException("Could not create cache directory: $dir");
    }
    file_put_contents(epg_cache_path(), json_encode($programmes));

    epg_purge_stale();

    return count($programmes);
}

/** Runs once per fetch cycle (not per batch) — drops programmes that ended
 * more than a day ago so the table doesn't grow unbounded. */
function epg_purge_stale(): int
{
    $stmt = db()->prepare('DELETE FROM epg WHERE end_time < (NOW() - INTERVAL 1 DAY)');
    $stmt->execute();
    return $stmt->rowCount();
}

function epg_parse_xmltv(string $xml): array
{
    $reader = new XMLReader();
    if (!$reader->XML($xml)) {
        throw new RuntimeException('Could not parse EPG XML.');
    }

    $programmes = [];

    while ($reader->read()) {
        if ($reader->nodeType !== XMLReader::ELEMENT || $reader->name !== 'programme') {
            continue;
        }

        $channelTvgId = $reader->getAttribute('channel');
        $startRaw = $reader->getAttribute('start');
        $stopRaw = $reader->getAttribute('stop');

        $node = $reader->expand();
        $title = null;
        $description = null;
        if ($node !== false) {
            foreach ($node->childNodes as $child) {
                if ($child->nodeName === 'title' && $title === null) {
                    $title = trim($child->textContent);
                } elseif ($child->nodeName === 'desc' && $description === null) {
                    $description = trim($child->textContent);
                }
            }
        }

        $startUtc = epg_parse_xmltv_datetime($startRaw);
        $stopUtc = epg_parse_xmltv_datetime($stopRaw);

        if ($channelTvgId && $title && $startUtc && $stopUtc) {
            $programmes[] = [
                'channel_tvg_id' => $channelTvgId,
                'title' => $title,
                'description' => $description,
                'start_time' => $startUtc,
                'end_time' => $stopUtc,
            ];
        }
    }

    $reader->close();

    return $programmes;
}

/** XMLTV datetimes look like "20260915000000 +0000" — parses to a UTC MySQL datetime string. */
function epg_parse_xmltv_datetime(?string $raw): ?string
{
    if ($raw === null || $raw === '') {
        return null;
    }

    $compact = str_replace(' ', '', trim($raw));
    $date = DateTimeImmutable::createFromFormat('YmdHisO', $compact);
    if ($date === false) {
        $date = DateTimeImmutable::createFromFormat('YmdHis', substr($compact, 0, 14));
    }
    if ($date === false) {
        return null;
    }

    return $date->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s');
}

function epg_channel_id_for_tvg_id(string $tvgId): ?string
{
    static $cache = [];
    if (array_key_exists($tvgId, $cache)) {
        return $cache[$tvgId];
    }

    $stmt = db()->prepare('SELECT id FROM channels WHERE tvg_id = ? LIMIT 1');
    $stmt->execute([$tvgId]);
    $id = $stmt->fetchColumn();

    $cache[$tvgId] = $id !== false ? $id : null;
    return $cache[$tvgId];
}

function epg_upsert_programme(array $programme): bool
{
    $channelId = epg_channel_id_for_tvg_id($programme['channel_tvg_id']);
    if ($channelId === null) {
        return false; // channel not in our catalogue — nothing to attach this to
    }

    db()->prepare(
        'INSERT INTO epg (id, channel_id, title, description, start_time, end_time, created_at)
         VALUES (UUID(), ?, ?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), end_time = VALUES(end_time)'
    )->execute([
        $channelId,
        $programme['title'],
        $programme['description'],
        $programme['start_time'],
        $programme['end_time'],
    ]);

    return true;
}

function epg_process_batch(int $batchSize): array
{
    $sourceUrl = env('EPG_SOURCE_URL', 'https://worker-9dd4.onrender.com/guide.xml.gz');
    $refreshIntervalHours = (int) env('EPG_REFRESH_INTERVAL_HOURS', '6');

    return run_cached_batch_job(
        EPG_JOB_NAME,
        $batchSize,
        $refreshIntervalHours,
        epg_cache_path(),
        fn () => epg_fetch_and_cache($sourceUrl),
        function (array $batch): int {
            $matched = 0;
            foreach ($batch as $programme) {
                if (epg_upsert_programme($programme)) {
                    $matched++;
                }
            }
            return $matched;
        },
    );
}

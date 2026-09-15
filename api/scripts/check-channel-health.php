<?php

declare(strict_types=1);

// Cron entry point. Set up a separate Hostinger cron job for this, e.g.:
// */10 * * * * php /home/.../api/scripts/check-channel-health.php
//
// Each run verifies a small batch of channels server-side (a curl HEAD
// request honoring any required User-Agent/Referer), oldest-checked first,
// so the whole catalogue rotates through verification over time without
// any script run doing unbounded work.

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Forbidden.');
}

require_once __DIR__ . '/../config/db.php';

function check_stream_reachable(string $url, ?string $userAgent, ?string $referrer): bool
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_NOBODY => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 8,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT => $userAgent ?: 'Mozilla/5.0 (compatible; ReelBoxHealthCheck/1.0)',
    ]);
    if ($referrer) {
        curl_setopt($ch, CURLOPT_REFERER, $referrer);
    }

    curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $errno = curl_errno($ch);
    curl_close($ch);

    return $errno === 0 && $code >= 200 && $code < 400;
}

$batchSize = (int) env('HEALTHCHECK_BATCH_SIZE', '50');

$stmt = db()->prepare(
    'SELECT id, stream_url, required_user_agent, required_referrer
     FROM channels
     WHERE status != \'disabled\'
     ORDER BY last_checked_at IS NOT NULL, last_checked_at ASC
     LIMIT ' . $batchSize
);
$stmt->execute();
$channels = $stmt->fetchAll();

$update = db()->prepare('UPDATE channels SET status = ?, last_checked_at = NOW() WHERE id = ?');

$checked = 0;
$reachable = 0;

foreach ($channels as $channel) {
    $ok = check_stream_reachable($channel['stream_url'], $channel['required_user_agent'], $channel['required_referrer']);
    $update->execute([$ok ? 'active' : 'unavailable', $channel['id']]);
    $checked++;
    $reachable += $ok ? 1 : 0;
}

echo "Checked {$checked} channels, {$reachable} reachable.\n";

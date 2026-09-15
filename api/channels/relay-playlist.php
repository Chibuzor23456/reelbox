<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Relay.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

require_auth();

$channelId = $_GET['id'] ?? '';
if ($channelId === '') {
    json_error('Missing channel id.', 400);
}

$stmt = db()->prepare(
    'SELECT stream_url, required_user_agent, required_referrer, status FROM channels WHERE id = ? LIMIT 1'
);
$stmt->execute([$channelId]);
$channel = $stmt->fetch();

if (!$channel || $channel['status'] === 'disabled') {
    json_error('Channel not found.', 404);
}

$targetUrl = isset($_GET['url']) ? relay_decode_url((string) $_GET['url']) : $channel['stream_url'];

if ($targetUrl === '' || !preg_match('#^https?://#i', $targetUrl)) {
    json_error('Invalid target URL.', 400);
}

$result = relay_fetch($targetUrl, $channel['required_user_agent'], $channel['required_referrer']);

if (!$result['ok']) {
    json_error('Could not reach the source stream: ' . $result['error'], 502);
}

if ($result['httpCode'] >= 400) {
    json_error('Source stream returned an error.', 502);
}

header('Content-Type: application/vnd.apple.mpegurl');
header('Cache-Control: no-store');
echo relay_rewrite_playlist($result['body'], $targetUrl, $channelId);

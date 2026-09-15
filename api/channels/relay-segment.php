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
$encodedUrl = $_GET['url'] ?? '';

if ($channelId === '' || $encodedUrl === '') {
    json_error('Missing parameters.', 400);
}

$stmt = db()->prepare(
    'SELECT required_user_agent, required_referrer, status FROM channels WHERE id = ? LIMIT 1'
);
$stmt->execute([$channelId]);
$channel = $stmt->fetch();

if (!$channel || $channel['status'] === 'disabled') {
    json_error('Channel not found.', 404);
}

$targetUrl = relay_decode_url((string) $encodedUrl);

if ($targetUrl === '' || !preg_match('#^https?://#i', $targetUrl)) {
    json_error('Invalid target URL.', 400);
}

$result = relay_fetch($targetUrl, $channel['required_user_agent'], $channel['required_referrer']);

if (!$result['ok']) {
    json_error('Could not reach the source: ' . $result['error'], 502);
}

http_response_code($result['httpCode'] ?: 200);
header('Content-Type: ' . ($result['contentType'] ?: 'application/octet-stream'));
header('Cache-Control: no-store');
echo $result['body'];

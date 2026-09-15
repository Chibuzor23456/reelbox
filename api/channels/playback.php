<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Relay.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

// This is the actual gate: catalogue browsing is public, but the real
// playback URL is only ever handed to a signed-in session.
require_auth();

$channelId = $_GET['id'] ?? '';
if ($channelId === '') {
    json_error('Missing channel id.', 400);
}

$stmt = db()->prepare(
    'SELECT id, name, logo_url, stream_url, playback_mode, status FROM channels WHERE id = ? LIMIT 1'
);
$stmt->execute([$channelId]);
$channel = $stmt->fetch();

if (!$channel || $channel['status'] === 'disabled') {
    json_error('Channel not found.', 404);
}

$url = $channel['playback_mode'] === 'relay'
    ? current_origin() . relay_build_playlist_url($channel['id'], $channel['stream_url'])
    : $channel['stream_url'];

json_response([
    'id' => $channel['id'],
    'name' => $channel['name'],
    'logo_url' => $channel['logo_url'],
    'url' => $url,
    'mode' => $channel['playback_mode'],
    'status' => $channel['status'],
]);

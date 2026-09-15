<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

// Same gate as live channels: browsing is public, the real playback URL
// only ever goes to a signed-in session.
require_auth();

$itemId = $_GET['id'] ?? '';
$episodeId = $_GET['episode_id'] ?? '';

if ($itemId === '') {
    json_error('Missing id.', 400);
}

if ($episodeId !== '') {
    $stmt = db()->prepare(
        'SELECT e.id, e.title, e.playback_url, e.duration_minutes, s.vod_item_id
         FROM vod_episodes e
         JOIN vod_seasons s ON s.id = e.vod_season_id
         WHERE e.id = ? AND s.vod_item_id = ?
         LIMIT 1'
    );
    $stmt->execute([$episodeId, $itemId]);
    $episode = $stmt->fetch();

    if (!$episode) {
        json_error('Episode not found.', 404);
    }

    json_response([
        'id' => $episode['id'],
        'title' => $episode['title'],
        'url' => $episode['playback_url'],
        'duration_minutes' => $episode['duration_minutes'],
    ]);
}

$stmt = db()->prepare(
    "SELECT id, title, playback_url, status FROM vod_items WHERE id = ? AND type = 'movie' LIMIT 1"
);
$stmt->execute([$itemId]);
$item = $stmt->fetch();

if (!$item || $item['status'] === 'disabled' || !$item['playback_url']) {
    json_error('Not found.', 404);
}

json_response([
    'id' => $item['id'],
    'title' => $item['title'],
    'url' => $item['playback_url'],
]);

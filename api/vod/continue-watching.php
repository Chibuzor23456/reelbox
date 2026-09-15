<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

$user = require_auth();
$limit = min(30, max(1, (int) ($_GET['limit'] ?? 15)));

$stmt = db()->prepare(
    "SELECT p.vod_episode_id, p.position_seconds, p.duration_seconds,
            i.id, i.type, i.title AS item_title, i.poster_url, i.year, i.genre,
            e.episode_number, e.title AS episode_title
     FROM vod_progress p
     JOIN vod_items i ON i.id = p.vod_item_id
     LEFT JOIN vod_episodes e ON e.id = p.vod_episode_id
     WHERE p.user_id = ? AND p.completed = 0 AND p.position_seconds > 0
     ORDER BY p.updated_at DESC
     LIMIT $limit"
);
$stmt->execute([$user['id']]);

$items = array_map(static function (array $row): array {
    return [
        'id' => $row['id'],
        'type' => $row['type'],
        'title' => $row['item_title'],
        'poster_url' => $row['poster_url'],
        'year' => $row['year'],
        'genre' => $row['genre'],
        'episode_id' => $row['vod_episode_id'],
        'episode_number' => $row['episode_number'],
        'episode_title' => $row['episode_title'],
        'position_seconds' => (int) $row['position_seconds'],
        'duration_seconds' => $row['duration_seconds'] !== null ? (int) $row['duration_seconds'] : null,
    ];
}, $stmt->fetchAll());

json_response(['items' => $items]);

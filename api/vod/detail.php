<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../config/db.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

$id = $_GET['id'] ?? '';
if ($id === '') {
    json_error('Missing id.', 400);
}

$stmt = db()->prepare(
    'SELECT id, type, title, synopsis, poster_url, backdrop_url, year, genre, runtime_minutes, status
     FROM vod_items WHERE id = ? LIMIT 1'
);
$stmt->execute([$id]);
$item = $stmt->fetch();

if (!$item || $item['status'] === 'disabled') {
    json_error('Not found.', 404);
}

if ($item['type'] === 'series') {
    $seasonsStmt = db()->prepare(
        'SELECT id, season_number FROM vod_seasons WHERE vod_item_id = ? ORDER BY season_number ASC'
    );
    $seasonsStmt->execute([$id]);
    $seasons = $seasonsStmt->fetchAll();

    $episodesStmt = db()->prepare(
        'SELECT id, episode_number, title, synopsis, duration_minutes
         FROM vod_episodes WHERE vod_season_id = ? ORDER BY episode_number ASC'
    );

    foreach ($seasons as &$season) {
        $episodesStmt->execute([$season['id']]);
        $season['episodes'] = $episodesStmt->fetchAll();
    }
    unset($season);

    $item['seasons'] = $seasons;
}

json_response($item);

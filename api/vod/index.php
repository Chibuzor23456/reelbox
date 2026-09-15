<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../config/db.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

// Public catalogue browsing — no auth, no playback_url ever returned here.
$limit = min(200, max(1, (int) ($_GET['limit'] ?? 60)));
$offset = max(0, (int) ($_GET['offset'] ?? 0));
$type = $_GET['type'] ?? null;
$genre = $_GET['genre'] ?? null;

$where = "status != 'disabled'";
$params = [];
if ($type === 'movie' || $type === 'series') {
    $where .= ' AND type = ?';
    $params[] = $type;
}
if ($genre) {
    $where .= ' AND genre = ?';
    $params[] = $genre;
}

$stmt = db()->prepare(
    "SELECT id, type, title, poster_url, year, genre, runtime_minutes, status
     FROM vod_items
     WHERE $where
     ORDER BY title ASC
     LIMIT $limit OFFSET $offset"
);
$stmt->execute($params);

json_response(['items' => $stmt->fetchAll()]);

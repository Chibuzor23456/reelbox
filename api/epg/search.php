<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../config/db.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

$query = trim((string) ($_GET['q'] ?? ''));
if ($query === '') {
    json_error('Missing search query.', 400);
}

$limit = min(50, max(1, (int) ($_GET['limit'] ?? 20)));

$stmt = db()->prepare(
    "SELECT e.title, e.description, e.start_time, e.end_time, c.id AS channel_id, c.name AS channel_name, c.logo_url
     FROM epg e
     JOIN channels c ON c.id = e.channel_id
     WHERE e.title LIKE ? AND e.end_time > UTC_TIMESTAMP()
     ORDER BY e.start_time ASC
     LIMIT $limit"
);
$stmt->execute(['%' . $query . '%']);

json_response(['results' => $stmt->fetchAll()]);

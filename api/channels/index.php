<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../config/db.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

// Public catalogue browsing — no auth required. Stream URLs never appear
// here; only /channels/playback.php (authenticated) resolves those.
$limit = min(200, max(1, (int) ($_GET['limit'] ?? 60)));
$offset = max(0, (int) ($_GET['offset'] ?? 0));
$category = $_GET['category'] ?? null;
$country = $_GET['country'] ?? null;
$shelf = $_GET['shelf'] ?? null;

$joins = '';
// Only 'active' (or never-checked, i.e. default) channels are surfaced —
// 'unavailable' means the health-check script (check-channel-health.php)
// already confirmed the stream doesn't respond, so there's no reason to
// still list it and send someone into a dead click.
$where = "c.status = 'active'";
$params = [];

if ($shelf) {
    $joins = ' JOIN channel_shelves sh ON sh.channel_id = c.id';
    $where .= ' AND sh.shelf_key = ?';
    $params[] = $shelf;
}

if ($category) {
    $where .= ' AND c.category = ?';
    $params[] = $category;
}

if ($country) {
    $where .= ' AND c.country = ?';
    $params[] = $country;
}

$stmt = db()->prepare(
    "SELECT c.id, c.name, c.logo_url, c.country, c.category, c.status
     FROM channels c
     $joins
     WHERE $where
     ORDER BY c.name ASC
     LIMIT $limit OFFSET $offset"
);
$stmt->execute($params);

json_response(['channels' => $stmt->fetchAll()]);

<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../config/db.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

$date = $_GET['date'] ?? gmdate('Y-m-d');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    json_error('Invalid date, expected YYYY-MM-DD.', 400);
}

$limit = min(100, max(1, (int) ($_GET['limit'] ?? 30)));
$offset = max(0, (int) ($_GET['offset'] ?? 0));

$dayStart = "$date 00:00:00";
$dayEnd = date('Y-m-d 00:00:00', strtotime("$date +1 day"));

// Only channels that actually have programme data for this date — a grid
// full of "no data" rows would be worse than a short, honest list.
$channelsStmt = db()->prepare(
    "SELECT DISTINCT c.id, c.name, c.logo_url, c.category, c.country
     FROM channels c
     JOIN epg e ON e.channel_id = c.id
     WHERE c.status != 'disabled' AND e.start_time < ? AND e.end_time > ?
     ORDER BY c.name ASC
     LIMIT $limit OFFSET $offset"
);
$channelsStmt->execute([$dayEnd, $dayStart]);
$channels = $channelsStmt->fetchAll();

if ($channels === []) {
    json_response(['date' => $date, 'channels' => []]);
}

$channelIds = array_column($channels, 'id');
$placeholders = implode(',', array_fill(0, count($channelIds), '?'));

$programmesStmt = db()->prepare(
    "SELECT channel_id, title, start_time, end_time FROM epg
     WHERE channel_id IN ($placeholders) AND start_time < ? AND end_time > ?
     ORDER BY start_time ASC"
);
$programmesStmt->execute([...$channelIds, $dayEnd, $dayStart]);

$byChannel = [];
foreach ($programmesStmt->fetchAll() as $row) {
    $byChannel[$row['channel_id']][] = [
        'title' => $row['title'],
        'start_time' => $row['start_time'],
        'end_time' => $row['end_time'],
    ];
}

foreach ($channels as &$channel) {
    $channel['programmes'] = $byChannel[$channel['id']] ?? [];
}
unset($channel);

json_response(['date' => $date, 'channels' => $channels]);

<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../config/db.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

$channelId = $_GET['channel_id'] ?? '';
if ($channelId === '') {
    json_error('Missing channel_id.', 400);
}

$date = $_GET['date'] ?? gmdate('Y-m-d');
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    json_error('Invalid date, expected YYYY-MM-DD.', 400);
}

$stmt = db()->prepare(
    'SELECT title, description, start_time, end_time FROM epg
     WHERE channel_id = ? AND start_time < ? AND end_time > ?
     ORDER BY start_time ASC'
);
$dayStart = "$date 00:00:00";
$dayEnd = date('Y-m-d 00:00:00', strtotime("$date +1 day"));
$stmt->execute([$channelId, $dayEnd, $dayStart]);

json_response(['date' => $date, 'programmes' => $stmt->fetchAll()]);

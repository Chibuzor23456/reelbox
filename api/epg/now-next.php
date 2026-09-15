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

$nowStmt = db()->prepare(
    'SELECT title, description, start_time, end_time FROM epg
     WHERE channel_id = ? AND start_time <= UTC_TIMESTAMP() AND end_time > UTC_TIMESTAMP()
     ORDER BY start_time ASC LIMIT 1'
);
$nowStmt->execute([$channelId]);
$now = $nowStmt->fetch() ?: null;

$nextStmt = db()->prepare(
    'SELECT title, description, start_time, end_time FROM epg
     WHERE channel_id = ? AND start_time >= UTC_TIMESTAMP()
     ORDER BY start_time ASC LIMIT 1'
);
$nextStmt->execute([$channelId]);
$next = $nextStmt->fetch() ?: null;

json_response(['now' => $now, 'next' => $next]);

<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

require_admin();

$userCounts = db()->query("SELECT status, COUNT(*) AS total FROM users GROUP BY status")->fetchAll();
$users = ['pending' => 0, 'active' => 0, 'suspended' => 0, 'deleted' => 0];
foreach ($userCounts as $row) {
    $users[$row['status']] = (int) $row['total'];
}

$channelCounts = db()->query("SELECT status, COUNT(*) AS total FROM channels GROUP BY status")->fetchAll();
$channels = ['active' => 0, 'unavailable' => 0, 'disabled' => 0];
foreach ($channelCounts as $row) {
    $channels[$row['status']] = (int) $row['total'];
}

$vodCounts = db()->query("SELECT type, COUNT(*) AS total FROM vod_items GROUP BY type")->fetchAll();
$vod = ['movie' => 0, 'series' => 0];
foreach ($vodCounts as $row) {
    $vod[$row['type']] = (int) $row['total'];
}

$epgProgrammeCount = (int) db()->query('SELECT COUNT(*) FROM epg')->fetchColumn();

$activeToday = (int) db()->query(
    "SELECT COUNT(DISTINCT user_id) FROM sessions WHERE last_used_at >= (NOW() - INTERVAL 1 DAY)"
)->fetchColumn();

$recentUsers = db()->query(
    'SELECT id, name, email, status, created_at FROM users ORDER BY created_at DESC LIMIT 5'
)->fetchAll();

$mostWatched = db()->query(
    'SELECT item_type, item_id, COUNT(*) AS watch_count
     FROM watch_history GROUP BY item_type, item_id ORDER BY watch_count DESC LIMIT 5'
)->fetchAll();

$playlistState = db()->prepare('SELECT status, total_items, last_full_run_at FROM ingestion_state WHERE job_name = ?');
$playlistState->execute(['live_playlist']);
$vodState = db()->prepare('SELECT status, total_items, last_full_run_at FROM ingestion_state WHERE job_name = ?');
$vodState->execute(['vod_catalogue']);
$epgState = db()->prepare('SELECT status, total_items, last_full_run_at FROM ingestion_state WHERE job_name = ?');
$epgState->execute(['epg_guide']);

json_response([
    'users' => array_merge(['total' => array_sum($users)], $users),
    'channels' => array_merge(['total' => array_sum($channels)], $channels),
    'vod' => array_merge(['total' => array_sum($vod)], $vod),
    'epg_programme_count' => $epgProgrammeCount,
    'active_users_today' => $activeToday,
    'recent_users' => $recentUsers,
    'most_watched' => $mostWatched,
    'playlist_status' => $playlistState->fetch() ?: null,
    'vod_status' => $vodState->fetch() ?: null,
    'epg_status' => $epgState->fetch() ?: null,
]);

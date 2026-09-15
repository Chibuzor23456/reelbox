<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/PlaylistIngestor.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

require_admin();

$state = ingestion_state_get(PLAYLIST_JOB_NAME);

$counts = db()->query('SELECT status, COUNT(*) AS total FROM channels GROUP BY status')->fetchAll();

$byStatus = ['active' => 0, 'unavailable' => 0, 'disabled' => 0];
foreach ($counts as $row) {
    $byStatus[$row['status']] = (int) $row['total'];
}

json_response([
    'source_url' => env('IPTV_PLAYLIST_URL', 'https://iptv-org.github.io/iptv/index.m3u'),
    'ingestion' => $state,
    'channels' => [
        'total' => array_sum($byStatus),
        'active' => $byStatus['active'],
        'unavailable' => $byStatus['unavailable'],
        'disabled' => $byStatus['disabled'],
    ],
]);

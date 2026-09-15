<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/VodIngestor.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

require_admin();

$state = ingestion_state_get(VOD_JOB_NAME);

$counts = db()->query(
    "SELECT type, status, COUNT(*) AS total FROM vod_items GROUP BY type, status"
)->fetchAll();

$summary = ['movie' => ['active' => 0, 'unavailable' => 0, 'disabled' => 0], 'series' => ['active' => 0, 'unavailable' => 0, 'disabled' => 0]];
foreach ($counts as $row) {
    if (isset($summary[$row['type']][$row['status']])) {
        $summary[$row['type']][$row['status']] = (int) $row['total'];
    }
}

json_response([
    'ingestion' => $state,
    'movies' => $summary['movie'],
    'series' => $summary['series'],
    'tmdb_configured' => env('TMDB_API_KEY') !== null && env('TMDB_API_KEY') !== '',
]);

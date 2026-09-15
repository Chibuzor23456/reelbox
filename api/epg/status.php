<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/EpgIngestor.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

require_admin();

$state = ingestion_state_get(EPG_JOB_NAME);

$counts = db()->query(
    "SELECT COUNT(DISTINCT channel_id) AS channels_with_epg, COUNT(*) AS total_programmes FROM epg"
)->fetch();

json_response([
    'source_url' => env('EPG_SOURCE_URL', 'https://worker-9dd4.onrender.com/guide.xml.gz'),
    'ingestion' => $state,
    'channels_with_epg' => (int) $counts['channels_with_epg'],
    'total_programmes' => (int) $counts['total_programmes'],
]);

<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/EpgIngestor.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed.', 405);
}

require_admin();

$batchSize = (int) env('EPG_BATCH_SIZE', '500');

try {
    json_response(epg_process_batch($batchSize));
} catch (Throwable $e) {
    json_error('EPG refresh failed: ' . $e->getMessage(), 500);
}

<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/VodIngestor.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed.', 405);
}

require_admin();

$batchSize = (int) env('VOD_BATCH_SIZE', '15');

try {
    json_response(vod_process_batch($batchSize));
} catch (Throwable $e) {
    json_error('VOD refresh failed: ' . $e->getMessage(), 500);
}

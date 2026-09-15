<?php

declare(strict_types=1);

// Cron entry point, e.g.: */10 * * * * php /home/.../api/scripts/ingest-vod.php
// Each run processes one bounded batch of VOD candidates (movies and
// series alike — see VodIngestor.php's adapter registry).

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Forbidden.');
}

require_once __DIR__ . '/../lib/VodIngestor.php';

$batchSize = (int) env('VOD_BATCH_SIZE', '15');

try {
    $result = vod_process_batch($batchSize);
    echo json_encode($result) . "\n";
} catch (Throwable $e) {
    fwrite(STDERR, 'VOD ingestion failed: ' . $e->getMessage() . "\n");
    exit(1);
}

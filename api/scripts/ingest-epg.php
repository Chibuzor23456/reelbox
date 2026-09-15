<?php

declare(strict_types=1);

// Cron entry point, e.g.: */15 * * * * php /home/.../api/scripts/ingest-epg.php

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Forbidden.');
}

require_once __DIR__ . '/../lib/EpgIngestor.php';

$batchSize = (int) env('EPG_BATCH_SIZE', '500');

try {
    $result = epg_process_batch($batchSize);
    echo json_encode($result) . "\n";
} catch (Throwable $e) {
    fwrite(STDERR, 'EPG ingestion failed: ' . $e->getMessage() . "\n");
    exit(1);
}

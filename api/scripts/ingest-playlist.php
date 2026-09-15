<?php

declare(strict_types=1);

// Cron entry point. Set up a Hostinger cron job to run this every few
// minutes, e.g.: */5 * * * * php /home/.../api/scripts/ingest-playlist.php
// Each run processes one bounded batch — see PlaylistIngestor.php.

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Forbidden.');
}

require_once __DIR__ . '/../lib/PlaylistIngestor.php';

$batchSize = (int) env('PLAYLIST_BATCH_SIZE', '200');

try {
    $result = playlist_process_batch($batchSize);
    echo json_encode($result) . "\n";
} catch (Throwable $e) {
    fwrite(STDERR, 'Playlist ingestion failed: ' . $e->getMessage() . "\n");
    exit(1);
}

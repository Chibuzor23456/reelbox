<?php

declare(strict_types=1);

// Cron entry point, e.g.: */30 * * * * php /home/.../api/scripts/sync-shelves.php
// All five curated shelves are small enough (tens to ~1000 channels each)
// to resync in one run — no chunking needed here, unlike the main playlist.

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Forbidden.');
}

require_once __DIR__ . '/../lib/ShelfSync.php';

foreach (shelf_sync_all() as $result) {
    echo json_encode($result) . "\n";
}

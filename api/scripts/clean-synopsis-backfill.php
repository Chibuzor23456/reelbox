<?php

declare(strict_types=1);

// One-off backfill: strips raw HTML out of synopsis values that were
// ingested before ia_clean_synopsis() existed. Safe to run repeatedly —
// already-clean text passes through strip_tags() unchanged.

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Forbidden.');
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../lib/vod/InternetArchiveAdapter.php';

function clean_table(string $table, string $idColumn): int
{
    $rows = db()->query("SELECT $idColumn AS id, synopsis FROM $table WHERE synopsis IS NOT NULL")->fetchAll();
    $update = db()->prepare("UPDATE $table SET synopsis = ? WHERE $idColumn = ?");

    $changed = 0;
    foreach ($rows as $row) {
        $cleaned = ia_clean_synopsis($row['synopsis']);
        if ($cleaned !== $row['synopsis']) {
            $update->execute([$cleaned, $row['id']]);
            $changed++;
        }
    }

    return $changed;
}

$items = clean_table('vod_items', 'id');
$episodes = clean_table('vod_episodes', 'id');

echo "Cleaned {$items} vod_items, {$episodes} vod_episodes.\n";

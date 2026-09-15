<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/CatalogResolver.php';

apply_cors();

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_input();
    $itemType = $input['item_type'] ?? '';
    $itemId = (string) ($input['item_id'] ?? '');

    if (!in_array($itemType, ['channel', 'movie', 'episode'], true) || $itemId === '') {
        json_error('Invalid item_type or item_id.', 400);
    }

    db()->prepare('INSERT INTO watch_history (id, user_id, item_type, item_id, watched_at) VALUES (UUID(), ?, ?, ?, NOW())')
        ->execute([$user['id'], $itemType, $itemId]);

    json_response(['status' => 'recorded']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $limit = min(50, max(1, (int) ($_GET['limit'] ?? 20)));

    // Most recent watch per item, not every historical event — "Recently
    // Watched" is a set of items, not a log.
    $stmt = db()->prepare(
        "SELECT item_type, item_id, MAX(watched_at) AS watched_at
         FROM watch_history
         WHERE user_id = ?
         GROUP BY item_type, item_id
         ORDER BY watched_at DESC
         LIMIT $limit"
    );
    $stmt->execute([$user['id']]);
    json_response(['items' => resolve_catalog_items($stmt->fetchAll())]);
}

json_error('Method not allowed.', 405);

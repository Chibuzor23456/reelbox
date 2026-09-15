<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/CatalogResolver.php';

apply_cors();

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = db()->prepare('SELECT item_type, item_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC');
    $stmt->execute([$user['id']]);
    json_response(['items' => resolve_catalog_items($stmt->fetchAll())]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_input();
    $itemType = $input['item_type'] ?? '';
    $itemId = (string) ($input['item_id'] ?? '');

    if (!in_array($itemType, ['channel', 'movie', 'series'], true) || $itemId === '') {
        json_error('Invalid item_type or item_id.', 400);
    }

    db()->prepare(
        'INSERT IGNORE INTO favorites (id, user_id, item_type, item_id, created_at) VALUES (UUID(), ?, ?, ?, NOW())'
    )->execute([$user['id'], $itemType, $itemId]);

    json_response(['status' => 'added']);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $itemType = $_GET['item_type'] ?? '';
    $itemId = $_GET['item_id'] ?? '';

    db()->prepare('DELETE FROM favorites WHERE user_id = ? AND item_type = ? AND item_id = ?')
        ->execute([$user['id'], $itemType, $itemId]);

    json_response(['status' => 'removed']);
}

json_error('Method not allowed.', 405);

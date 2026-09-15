<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/Audit.php';

apply_cors();

$admin = require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search = trim((string) ($_GET['search'] ?? ''));
    $type = $_GET['type'] ?? null;
    $limit = min(200, max(1, (int) ($_GET['limit'] ?? 50)));
    $offset = max(0, (int) ($_GET['offset'] ?? 0));

    $where = '1=1';
    $params = [];
    if ($search !== '') {
        $where .= ' AND title LIKE ?';
        $params[] = "%$search%";
    }
    if ($type === 'movie' || $type === 'series') {
        $where .= ' AND type = ?';
        $params[] = $type;
    }

    $stmt = db()->prepare(
        "SELECT id, type, title, poster_url, year, genre, source_identifier, status, updated_at
         FROM vod_items
         WHERE $where
         ORDER BY title ASC
         LIMIT $limit OFFSET $offset"
    );
    $stmt->execute($params);

    json_response(['items' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_input();
    $itemId = (string) ($input['id'] ?? '');
    $status = $input['status'] ?? null;

    if ($itemId === '' || !in_array($status, ['active', 'unavailable', 'disabled'], true)) {
        json_error('Missing id or invalid status.', 400);
    }

    db()->prepare('UPDATE vod_items SET status = ? WHERE id = ?')->execute([$status, $itemId]);
    audit_log($admin['id'], 'vod.status_updated', 'vod_item', $itemId, 'success', ['status' => $status]);

    json_response(['status' => 'updated']);
}

json_error('Method not allowed.', 405);

<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/Audit.php';

apply_cors();

$admin = require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search = trim((string) ($_GET['search'] ?? ''));
    $category = $_GET['category'] ?? null;
    $country = $_GET['country'] ?? null;
    $limit = min(200, max(1, (int) ($_GET['limit'] ?? 50)));
    $offset = max(0, (int) ($_GET['offset'] ?? 0));

    $where = '1=1';
    $params = [];
    if ($search !== '') {
        $where .= ' AND name LIKE ?';
        $params[] = "%$search%";
    }
    if ($category) {
        $where .= ' AND category = ?';
        $params[] = $category;
    }
    if ($country) {
        $where .= ' AND country = ?';
        $params[] = $country;
    }

    $stmt = db()->prepare(
        "SELECT id, name, logo_url, country, category, playback_mode, status, last_checked_at, updated_at
         FROM channels
         WHERE $where
         ORDER BY name ASC
         LIMIT $limit OFFSET $offset"
    );
    $stmt->execute($params);

    json_response(['channels' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_input();
    $channelId = (string) ($input['id'] ?? '');
    $status = $input['status'] ?? null;

    if ($channelId === '' || !in_array($status, ['active', 'unavailable', 'disabled'], true)) {
        json_error('Missing id or invalid status.', 400);
    }

    db()->prepare('UPDATE channels SET status = ? WHERE id = ?')->execute([$status, $channelId]);
    audit_log($admin['id'], 'channel.status_updated', 'channel', $channelId, 'success', ['status' => $status]);

    json_response(['status' => 'updated']);
}

json_error('Method not allowed.', 405);

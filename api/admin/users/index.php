<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

require_admin();

$search = trim((string) ($_GET['search'] ?? ''));
$limit = min(200, max(1, (int) ($_GET['limit'] ?? 50)));
$offset = max(0, (int) ($_GET['offset'] ?? 0));

$where = '1=1';
$params = [];
if ($search !== '') {
    $where .= ' AND (name LIKE ? OR email LIKE ?)';
    $params[] = "%$search%";
    $params[] = "%$search%";
}

$stmt = db()->prepare(
    "SELECT id, name, email, role, status, created_at, updated_at
     FROM users
     WHERE $where
     ORDER BY created_at DESC
     LIMIT $limit OFFSET $offset"
);
$stmt->execute($params);

json_response(['users' => $stmt->fetchAll()]);

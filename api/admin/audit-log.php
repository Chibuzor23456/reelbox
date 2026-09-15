<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

require_admin();

$limit = min(200, max(1, (int) ($_GET['limit'] ?? 50)));
$offset = max(0, (int) ($_GET['offset'] ?? 0));

$stmt = db()->prepare(
    "SELECT a.id, a.action, a.target_type, a.target_id, a.result, a.metadata, a.created_at,
            u.name AS admin_name, u.email AS admin_email
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.admin_id
     ORDER BY a.created_at DESC
     LIMIT $limit OFFSET $offset"
);
$stmt->execute();

json_response(['entries' => $stmt->fetchAll()]);

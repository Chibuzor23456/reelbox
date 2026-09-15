<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/Audit.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed.', 405);
}

$admin = require_admin();
$input = json_input();
$userId = (string) ($input['id'] ?? '');

if ($userId === '') {
    json_error('Missing user id.', 400);
}

$stmt = db()->prepare('DELETE FROM sessions WHERE user_id = ?');
$stmt->execute([$userId]);

audit_log($admin['id'], 'user.force_logout', 'user', $userId, 'success', ['sessions_revoked' => $stmt->rowCount()]);

json_response(['status' => 'logged_out', 'sessions_revoked' => $stmt->rowCount()]);

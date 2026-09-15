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
$status = $input['status'] ?? null;
$role = $input['role'] ?? null;

if ($userId === '') {
    json_error('Missing user id.', 400);
}

if ($userId === $admin['id'] && ($status !== null || $role !== null)) {
    json_error('You cannot change your own status or role.', 400);
}

$validStatuses = ['pending', 'active', 'suspended', 'deleted'];
$validRoles = ['admin', 'user'];

if ($status !== null && !in_array($status, $validStatuses, true)) {
    json_error('Invalid status.', 400);
}
if ($role !== null && !in_array($role, $validRoles, true)) {
    json_error('Invalid role.', 400);
}

$sets = [];
$params = [];
if ($status !== null) {
    $sets[] = 'status = ?';
    $params[] = $status;
}
if ($role !== null) {
    $sets[] = 'role = ?';
    $params[] = $role;
}

if ($sets === []) {
    json_error('Nothing to update.', 400);
}

$params[] = $userId;
$updated = db()->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($params);

if (!$updated) {
    json_error('User not found.', 404);
}

// Status changes end sessions immediately — a suspended/deleted account
// shouldn't keep working until its cookie happens to expire.
if ($status !== null && $status !== 'active') {
    db()->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$userId]);
}

audit_log($admin['id'], 'user.updated', 'user', $userId, 'success', ['status' => $status, 'role' => $role]);

json_response(['status' => 'updated']);

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
$id = (string) ($input['id'] ?? '');

if ($id === '') {
    json_error('Missing invitation id.', 400);
}

$stmt = db()->prepare("SELECT email FROM invitations WHERE id = ? AND status = 'pending' LIMIT 1");
$stmt->execute([$id]);
$invitation = $stmt->fetch();

if (!$invitation) {
    json_error('Pending invitation not found.', 404);
}

db()->prepare("UPDATE invitations SET status = 'revoked' WHERE id = ?")->execute([$id]);

audit_log($admin['id'], 'invitation.revoked', 'invitation', $invitation['email']);

json_response(['status' => 'revoked']);

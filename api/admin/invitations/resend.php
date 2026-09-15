<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/Audit.php';
require_once __DIR__ . '/../../lib/Mailer.php';

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

$stmt = db()->prepare("SELECT id, email, name FROM invitations WHERE id = ? AND status = 'pending' LIMIT 1");
$stmt->execute([$id]);
$invitation = $stmt->fetch();

if (!$invitation) {
    json_error('Pending invitation not found.', 404);
}

$token = bin2hex(random_bytes(32));
$tokenHash = hash('sha256', $token);
$ttlDays = (int) env('INVITATION_TTL_DAYS', '7');
$expiresAt = (new DateTimeImmutable("+{$ttlDays} days"))->format('Y-m-d H:i:s');

db()->prepare('UPDATE invitations SET token_hash = ?, expires_at = ? WHERE id = ?')
    ->execute([$tokenHash, $expiresAt, $id]);

$inviteLink = env('APP_FRONTEND_ORIGIN', '') . '/accept-invite?token=' . $token;
$emailSent = send_email(
    $invitation['email'],
    'You\'re invited to ReelBox',
    invitation_email_html((string) $invitation['name'], $inviteLink, $expiresAt),
);

audit_log($admin['id'], 'invitation.resent', 'invitation', $invitation['email'], 'success', ['email_sent' => $emailSent]);

json_response([
    'email' => $invitation['email'],
    'token' => $token,
    'invite_link' => $inviteLink,
    'expires_at' => $expiresAt,
    'email_sent' => $emailSent,
]);

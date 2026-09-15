<?php

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../lib/Auth.php';
require_once __DIR__ . '/../../lib/Audit.php';
require_once __DIR__ . '/../../lib/Mailer.php';

apply_cors();

$admin = require_admin();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = db()->query(
        'SELECT id, email, name, status, expires_at, created_at, accepted_at
         FROM invitations ORDER BY created_at DESC LIMIT 200'
    );
    json_response(['invitations' => $stmt->fetchAll()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_input();
    $email = trim((string) ($input['email'] ?? ''));
    $name = trim((string) ($input['name'] ?? ''));

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('A valid email is required.', 400);
    }

    $existingUser = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $existingUser->execute([$email]);
    if ($existingUser->fetchColumn()) {
        json_error('This email already has an account.', 409);
    }

    $existingInvite = db()->prepare("SELECT id FROM invitations WHERE email = ? AND status = 'pending' LIMIT 1");
    $existingInvite->execute([$email]);
    if ($existingInvite->fetchColumn()) {
        json_error('A pending invitation already exists for this email — resend it instead.', 409);
    }

    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $ttlDays = (int) env('INVITATION_TTL_DAYS', '7');
    $expiresAt = (new DateTimeImmutable("+{$ttlDays} days"))->format('Y-m-d H:i:s');

    db()->prepare(
        "INSERT INTO invitations (id, email, name, token_hash, invited_by, status, expires_at, created_at)
         VALUES (UUID(), ?, ?, ?, ?, 'pending', ?, NOW())"
    )->execute([$email, $name !== '' ? $name : null, $tokenHash, $admin['id'], $expiresAt]);

    $inviteLink = env('APP_FRONTEND_ORIGIN', '') . '/accept-invite?token=' . $token;
    $emailSent = send_email(
        $email,
        'You\'re invited to ReelBox',
        invitation_email_html($name, $inviteLink, $expiresAt),
    );

    audit_log($admin['id'], 'invitation.created', 'invitation', $email, 'success', [
        'email' => $email,
        'email_sent' => $emailSent,
    ]);

    json_response([
        'email' => $email,
        'token' => $token,
        'invite_link' => $inviteLink,
        'expires_at' => $expiresAt,
        'email_sent' => $emailSent,
    ], 201);
}

json_error('Method not allowed.', 405);

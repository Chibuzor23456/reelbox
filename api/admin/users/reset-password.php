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
$userId = (string) ($input['id'] ?? '');

if ($userId === '') {
    json_error('Missing user id.', 400);
}

$stmt = db()->prepare('SELECT name, email FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$userId]);
$user = $stmt->fetch();

if (!$user) {
    json_error('User not found.', 404);
}

$tempPassword = bin2hex(random_bytes(6));

db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    ->execute([password_hash($tempPassword, PASSWORD_DEFAULT), $userId]);

db()->prepare('DELETE FROM sessions WHERE user_id = ?')->execute([$userId]);

$emailSent = send_email(
    $user['email'],
    'Your ReelBox password was reset',
    password_reset_email_html((string) $user['name'], $tempPassword),
);

audit_log($admin['id'], 'user.password_reset', 'user', $userId, 'success', ['email_sent' => $emailSent]);

json_response(['email' => $user['email'], 'temporary_password' => $tempPassword, 'email_sent' => $emailSent]);

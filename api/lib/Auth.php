<?php

declare(strict_types=1);

require_once __DIR__ . '/Session.php';
require_once __DIR__ . '/Response.php';

function current_user(): ?array
{
    $token = current_session_token();
    if ($token === null) {
        return null;
    }

    $tokenHash = hash('sha256', $token);

    $stmt = db()->prepare(
        'SELECT u.id, u.name, u.email, u.role, u.status
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > NOW()
         LIMIT 1'
    );
    $stmt->execute([$tokenHash]);
    $user = $stmt->fetch();

    if (!$user || $user['status'] !== 'active') {
        return null;
    }

    db()->prepare('UPDATE sessions SET last_used_at = NOW() WHERE token_hash = ?')
        ->execute([$tokenHash]);

    unset($user['status']);
    return $user;
}

function require_auth(): array
{
    $user = current_user();

    if ($user === null) {
        json_error('Sign in required.', 401);
    }

    return $user;
}

function require_admin(): array
{
    $user = require_auth();

    if ($user['role'] !== 'admin') {
        json_error('Admin access required.', 403);
    }

    return $user;
}

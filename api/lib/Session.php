<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/db.php';

const SESSION_COOKIE = 'reelbox_session';
const SESSION_TTL_DAYS = 30;

/** Creates a DB-backed session row and sets the session cookie. Returns the raw token. */
function issue_session(string $userId): string
{
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $expiresAt = (new DateTimeImmutable('+' . SESSION_TTL_DAYS . ' days'))->format('Y-m-d H:i:s');

    $stmt = db()->prepare(
        'INSERT INTO sessions (id, user_id, token_hash, user_agent, ip_address, created_at, last_used_at, expires_at)
         VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW(), ?)'
    );
    $stmt->execute([
        $userId,
        $tokenHash,
        substr((string) ($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
        $_SERVER['REMOTE_ADDR'] ?? null,
        $expiresAt,
    ]);

    set_session_cookie($token, time() + SESSION_TTL_DAYS * 86400);

    return $token;
}

function set_session_cookie(string $value, int $expires): void
{
    setcookie(SESSION_COOKIE, $value, [
        'expires' => $expires,
        'path' => '/',
        'domain' => env('APP_COOKIE_DOMAIN', ''),
        'secure' => env('APP_ENV', 'production') === 'production',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function clear_session_cookie(): void
{
    set_session_cookie('', time() - 3600);
}

function current_session_token(): ?string
{
    $token = $_COOKIE[SESSION_COOKIE] ?? null;
    return ($token !== null && $token !== '') ? $token : null;
}

function revoke_current_session(): void
{
    $token = current_session_token();
    if ($token === null) {
        return;
    }

    db()->prepare('DELETE FROM sessions WHERE token_hash = ?')
        ->execute([hash('sha256', $token)]);

    clear_session_cookie();
}

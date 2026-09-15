<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/Legal.php';
require_once __DIR__ . '/../lib/RateLimit.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed.', 405);
}

// Invite tokens are 32 random bytes (unguessable), but bounding attempts
// per IP still costs an attacker nothing to add and closes off any
// automated-guessing angle entirely.
rate_limit_or_reject('accept-invite:' . client_ip(), 20, 60 * 60);

$input = json_input();
$token = trim((string) ($input['token'] ?? ''));
$name = trim((string) ($input['name'] ?? ''));
$password = (string) ($input['password'] ?? '');
$acceptedTerms = (bool) ($input['accepted_terms'] ?? false);

if ($token === '' || $name === '' || strlen($password) < 8) {
    json_error('Invite token, name and a password of at least 8 characters are required.');
}

if (!$acceptedTerms) {
    json_error('You must accept the Terms of Service and Privacy Policy to continue.');
}

$tokenHash = hash('sha256', $token);

$stmt = db()->prepare(
    'SELECT id, email FROM invitations
     WHERE token_hash = ? AND status = \'pending\' AND expires_at > NOW()
     LIMIT 1'
);
$stmt->execute([$tokenHash]);
$invitation = $stmt->fetch();

if (!$invitation) {
    json_error('This invitation is invalid or has expired.', 404);
}

$db = db();
$db->beginTransaction();

try {
    $stmt = $db->prepare(
        'INSERT INTO users (id, name, email, password_hash, role, status)
         VALUES (UUID(), ?, ?, ?, \'user\', \'active\')'
    );
    $stmt->execute([$name, $invitation['email'], password_hash($password, PASSWORD_DEFAULT)]);

    $stmt = $db->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$invitation['email']]);
    $userId = $stmt->fetchColumn();

    $db->prepare('UPDATE invitations SET status = \'accepted\', accepted_at = NOW() WHERE id = ?')
        ->execute([$invitation['id']]);

    $ip = $_SERVER['REMOTE_ADDR'] ?? null;
    $acceptanceStmt = $db->prepare(
        'INSERT INTO legal_acceptances (id, user_id, document_type, version, accepted_at, ip_address)
         VALUES (UUID(), ?, ?, ?, NOW(), ?)'
    );
    $acceptanceStmt->execute([$userId, 'terms', LEGAL_TERMS_VERSION, $ip]);
    $acceptanceStmt->execute([$userId, 'privacy', LEGAL_PRIVACY_VERSION, $ip]);

    $db->commit();
} catch (Throwable $e) {
    $db->rollBack();
    json_error('Could not accept this invitation. It may already be in use.', 409);
}

issue_session($userId);

json_response(['id' => $userId, 'name' => $name, 'email' => $invitation['email'], 'role' => 'user']);

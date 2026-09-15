<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/RateLimit.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed.', 405);
}

// By IP, not by attempted email — rate-limiting per email would let an
// attacker enumerate valid accounts by watching when the limit kicks in.
rate_limit_or_reject('login:' . client_ip(), 10, 15 * 60);

$input = json_input();
$email = trim((string) ($input['email'] ?? ''));
$password = (string) ($input['password'] ?? '');

if ($email === '' || $password === '') {
    json_error('Email and password are required.');
}

$stmt = db()->prepare(
    'SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1'
);
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_error('Invalid email or password.', 401);
}

if ($user['status'] !== 'active') {
    json_error('This account is not active.', 403);
}

issue_session($user['id']);

json_response([
    'id' => $user['id'],
    'name' => $user['name'],
    'email' => $user['email'],
    'role' => $user['role'],
]);

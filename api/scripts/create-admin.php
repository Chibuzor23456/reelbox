<?php

declare(strict_types=1);

// One-off bootstrap script: creates the first admin account so someone can
// actually sign in and start issuing invitations. Run once via CLI/SSH,
// e.g.: php create-admin.php "Jane Doe" jane@example.com "a-strong-password"

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit('Forbidden.');
}

require_once __DIR__ . '/../config/db.php';

[$name, $email, $password] = [$argv[1] ?? null, $argv[2] ?? null, $argv[3] ?? null];

if (!$name || !$email || !$password) {
    fwrite(STDERR, "Usage: php create-admin.php \"Name\" email@example.com password\n");
    exit(1);
}

$stmt = db()->prepare(
    "INSERT INTO users (id, name, email, password_hash, role, status)
     VALUES (UUID(), ?, ?, ?, 'admin', 'active')"
);
$stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);

echo "Admin account created for {$email}\n";

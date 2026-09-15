<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function db(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        $host = env('DB_HOST', '127.0.0.1');
        $name = env('DB_NAME', 'reelbox');
        $user = env('DB_USER', 'root');
        $pass = env('DB_PASS', '');
        $dsn = "mysql:host=$host;dbname=$name;charset=utf8mb4";

        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }

    return $pdo;
}

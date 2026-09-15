<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

/**
 * Frontend and API run as separate Hostinger sites (Node.js site + PHP site
 * on a subdomain), so every browser request here is cross-origin.
 */
function apply_cors(): void
{
    $allowedOrigin = env('APP_FRONTEND_ORIGIN', 'http://localhost:5173');
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($origin !== '' && $origin === $allowedOrigin) {
        header("Access-Control-Allow-Origin: $allowedOrigin");
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

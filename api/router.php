<?php

declare(strict_types=1);

// Dev-only router for `php -S localhost:8000 router.php`. PHP's built-in
// server doesn't process .htaccess at all, so without this, every
// extensionless request the frontend actually makes (e.g. /auth/login)
// would 404 locally even though it works correctly in production under
// real Apache. This replicates api/.htaccess's rules exactly: block
// dotfiles and internal folders, route extensionless paths to their .php
// file, fall back to a directory's index.php.

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

if (preg_match('#/\.#', $uri) || preg_match('#^/(config|lib|scripts|storage)(/|$)#', $uri)) {
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['message' => 'Forbidden']);
    return true;
}

$file = __DIR__ . $uri;

if ($uri !== '/' && is_file($file)) {
    return false; // let the built-in server serve it as-is (static file or already .php)
}

$phpFile = rtrim($file, '/') . '.php';
if (is_file($phpFile)) {
    require $phpFile;
    return true;
}

if (is_dir($file) && is_file($file . '/index.php')) {
    require $file . '/index.php';
    return true;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['message' => 'Not found']);
return true;

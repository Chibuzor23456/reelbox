<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Session.php';
require_once __DIR__ . '/../lib/Response.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Method not allowed.', 405);
}

revoke_current_session();

json_response(['message' => 'Signed out.']);

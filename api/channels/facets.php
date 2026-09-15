<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../config/db.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

// Drives the Live TV category tabs / country filter from what's actually
// in the catalogue, rather than a hardcoded guess at IPTV-org's group-title
// vocabulary (which varies — "General", "Movies", "Sports", "Religious",
// "Undefined", etc. — real values, not a fixed enum).
$categories = db()->query(
    "SELECT category, COUNT(*) AS total FROM channels
     WHERE status = 'active' AND category IS NOT NULL
     GROUP BY category
     ORDER BY total DESC
     LIMIT 20"
)->fetchAll();

$countries = db()->query(
    "SELECT country, COUNT(*) AS total FROM channels
     WHERE status = 'active' AND country IS NOT NULL
     GROUP BY country
     ORDER BY total DESC
     LIMIT 60"
)->fetchAll();

json_response(['categories' => $categories, 'countries' => $countries]);

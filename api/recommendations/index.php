<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';
require_once __DIR__ . '/../lib/CatalogResolver.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

// Deliberately simple and deterministic (PRD section 11): count-based
// aggregation, no ML/LLM involved.
$user = require_auth();

$sections = [];

// Most Watched — platform-wide popularity.
$mostWatchedStmt = db()->query(
    'SELECT item_type, item_id, COUNT(*) AS watch_count
     FROM watch_history
     GROUP BY item_type, item_id
     ORDER BY watch_count DESC
     LIMIT 15'
);
$mostWatched = resolve_catalog_items($mostWatchedStmt->fetchAll());
if ($mostWatched !== []) {
    $sections[] = ['key' => 'most_watched', 'title' => 'Most Watched', 'items' => $mostWatched];
}

// Because You Watch {genre} — the user's own most-watched movie genre,
// suggesting other active titles in it they haven't seen yet. (Scoped to
// movie watches for now — folding in series-via-episode genre affinity is
// a reasonable follow-up, not required for a first useful version.)
$topGenreStmt = db()->prepare(
    "SELECT i.genre, COUNT(*) AS c
     FROM watch_history h
     JOIN vod_items i ON i.id = h.item_id AND h.item_type = 'movie'
     WHERE h.user_id = ? AND i.genre IS NOT NULL
     GROUP BY i.genre
     ORDER BY c DESC
     LIMIT 1"
);
$topGenreStmt->execute([$user['id']]);
$topGenre = $topGenreStmt->fetchColumn();

if ($topGenre) {
    $genreItemsStmt = db()->prepare(
        "SELECT id, type, title, poster_url, year, genre, runtime_minutes, status
         FROM vod_items
         WHERE genre = ? AND status = 'active'
           AND id NOT IN (SELECT item_id FROM watch_history WHERE user_id = ?)
         ORDER BY created_at DESC
         LIMIT 15"
    );
    $genreItemsStmt->execute([$topGenre, $user['id']]);
    $genreItems = $genreItemsStmt->fetchAll();
    if ($genreItems !== []) {
        $sections[] = ['key' => 'because_you_watch', 'title' => "Because you watch $topGenre", 'items' => $genreItems];
    }
}

json_response(['sections' => $sections]);

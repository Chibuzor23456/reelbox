<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Response.php';
require_once __DIR__ . '/../config/db.php';

apply_cors();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Method not allowed.', 405);
}

// Public — search spans live and on-demand content without requiring sign
// in, same as browsing. Results are grouped and clearly typed so the UI can
// label each as Live / Movie / Series / Episode, per the PRD.
$query = trim((string) ($_GET['q'] ?? ''));
if ($query === '' || mb_strlen($query) < 2) {
    json_error('Search query must be at least 2 characters.', 400);
}

$like = '%' . $query . '%';
$sections = [];

// Live channels — name, country, category. (Language isn't populated by
// the ingestion pipeline yet, so it isn't a real searchable facet — see
// Phase 2's parser notes; adding it here would just never match anything.)
$stmt = db()->prepare(
    "SELECT id, name, logo_url, country, category, status
     FROM channels
     WHERE status != 'disabled' AND (name LIKE ? OR country LIKE ? OR category LIKE ?)
     ORDER BY name ASC LIMIT 20"
);
$stmt->execute([$like, $like, $like]);
$channels = array_map(static fn (array $c): array => [
    'item_type' => 'channel',
    'id' => $c['id'],
    'name' => $c['name'],
    'logo_url' => $c['logo_url'],
    'status' => $c['status'],
], $stmt->fetchAll());
if ($channels !== []) {
    $sections[] = ['key' => 'channels', 'title' => 'Live TV', 'items' => $channels];
}

// Movies & Series — title, genre.
$stmt = db()->prepare(
    "SELECT id, type, title, poster_url, year, genre, runtime_minutes, status
     FROM vod_items
     WHERE status != 'disabled' AND (title LIKE ? OR genre LIKE ?)
     ORDER BY title ASC LIMIT 40"
);
$stmt->execute([$like, $like]);

$movies = [];
$series = [];
foreach ($stmt->fetchAll() as $row) {
    $item = [
        'item_type' => $row['type'],
        'id' => $row['id'],
        'title' => $row['title'],
        'poster_url' => $row['poster_url'],
        'year' => $row['year'],
        'genre' => $row['genre'],
        'runtime_minutes' => $row['runtime_minutes'],
        'status' => $row['status'],
    ];
    if ($row['type'] === 'movie') {
        $movies[] = $item;
    } else {
        $series[] = $item;
    }
}
if ($movies !== []) {
    $sections[] = ['key' => 'movies', 'title' => 'Movies', 'items' => $movies];
}
if ($series !== []) {
    $sections[] = ['key' => 'series', 'title' => 'Series', 'items' => $series];
}

// Episodes — surfaced under their parent series' identity, same convention
// as favorites/history/continue-watching use for episode-shaped rows.
$stmt = db()->prepare(
    "SELECT e.id AS episode_id, e.episode_number, e.title AS episode_title,
            i.id, i.title, i.poster_url, i.year, i.genre, i.status
     FROM vod_episodes e
     JOIN vod_seasons s ON s.id = e.vod_season_id
     JOIN vod_items i ON i.id = s.vod_item_id
     WHERE i.status != 'disabled' AND e.title LIKE ?
     ORDER BY e.title ASC LIMIT 20"
);
$stmt->execute([$like]);
$episodes = array_map(static fn (array $row): array => [
    'item_type' => 'episode',
    'id' => $row['id'],
    'episode_id' => $row['episode_id'],
    'episode_number' => $row['episode_number'],
    'title' => $row['title'],
    'episode_title' => $row['episode_title'],
    'poster_url' => $row['poster_url'],
    'year' => $row['year'],
    'genre' => $row['genre'],
    'status' => $row['status'],
], $stmt->fetchAll());
if ($episodes !== []) {
    $sections[] = ['key' => 'episodes', 'title' => 'Episodes', 'items' => $episodes];
}

// EPG programmes — a distinct shape (not a catalogue item), kept separate.
$stmt = db()->prepare(
    "SELECT e.title, e.description, e.start_time, e.end_time, c.id AS channel_id, c.name AS channel_name, c.logo_url
     FROM epg e
     JOIN channels c ON c.id = e.channel_id
     WHERE e.title LIKE ? AND e.end_time > UTC_TIMESTAMP()
     ORDER BY e.start_time ASC LIMIT 10"
);
$stmt->execute([$like]);

json_response(['query' => $query, 'sections' => $sections, 'programmes' => $stmt->fetchAll()]);

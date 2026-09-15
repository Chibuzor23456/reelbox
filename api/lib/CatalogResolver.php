<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

/**
 * Resolves a list of {item_type, item_id} rows (from favorites,
 * watch_history, etc.) into display-ready catalogue entries, batch-fetching
 * from channels/vod_items/vod_episodes rather than N+1 querying per row.
 * Rows whose underlying item has since been deleted are silently dropped.
 */
function resolve_catalog_items(array $rows): array
{
    $channelIds = [];
    $vodIds = [];
    $episodeIds = [];

    foreach ($rows as $row) {
        if ($row['item_type'] === 'channel') {
            $channelIds[] = $row['item_id'];
        } elseif (in_array($row['item_type'], ['movie', 'series'], true)) {
            $vodIds[] = $row['item_id'];
        } elseif ($row['item_type'] === 'episode') {
            $episodeIds[] = $row['item_id'];
        }
    }

    $channels = $channelIds !== []
        ? fetch_by_ids('channels', ['id', 'name', 'logo_url', 'status'], $channelIds)
        : [];
    $vodItems = $vodIds !== []
        ? fetch_by_ids('vod_items', ['id', 'type', 'title', 'poster_url', 'year', 'genre', 'runtime_minutes', 'status'], $vodIds)
        : [];
    $episodes = $episodeIds !== [] ? fetch_episode_context($episodeIds) : [];

    $result = [];
    foreach ($rows as $row) {
        if ($row['item_type'] === 'channel' && isset($channels[$row['item_id']])) {
            $result[] = array_merge(['item_type' => 'channel'], $channels[$row['item_id']]);
        } elseif (in_array($row['item_type'], ['movie', 'series'], true) && isset($vodItems[$row['item_id']])) {
            $result[] = array_merge(['item_type' => $row['item_type']], $vodItems[$row['item_id']]);
        } elseif ($row['item_type'] === 'episode' && isset($episodes[$row['item_id']])) {
            $result[] = $episodes[$row['item_id']];
        }
    }

    return $result;
}

function fetch_by_ids(string $table, array $columns, array $ids): array
{
    $ids = array_values(array_unique($ids));
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $cols = implode(', ', $columns);

    $stmt = db()->prepare("SELECT $cols FROM $table WHERE id IN ($placeholders)");
    $stmt->execute($ids);

    $byId = [];
    foreach ($stmt->fetchAll() as $row) {
        $byId[$row['id']] = $row;
    }

    return $byId;
}

/** Episodes display under their parent series' identity (id, poster, etc.)
 * with the specific episode noted alongside, since that's what a "you were
 * watching..." row should link back to. */
function fetch_episode_context(array $episodeIds): array
{
    $episodeIds = array_values(array_unique($episodeIds));
    $placeholders = implode(',', array_fill(0, count($episodeIds), '?'));

    $stmt = db()->prepare(
        "SELECT e.id AS episode_id, e.episode_number, e.title AS episode_title,
                i.id, i.title, i.poster_url, i.year, i.genre, i.status
         FROM vod_episodes e
         JOIN vod_seasons s ON s.id = e.vod_season_id
         JOIN vod_items i ON i.id = s.vod_item_id
         WHERE e.id IN ($placeholders)"
    );
    $stmt->execute($episodeIds);

    $byId = [];
    foreach ($stmt->fetchAll() as $row) {
        $byId[$row['episode_id']] = [
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
        ];
    }

    return $byId;
}

<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../lib/Auth.php';

apply_cors();

$user = require_auth();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_input();
    $vodItemId = (string) ($input['vod_item_id'] ?? '');
    $vodEpisodeId = isset($input['vod_episode_id']) && $input['vod_episode_id'] !== ''
        ? (string) $input['vod_episode_id']
        : null;
    $position = (int) ($input['position_seconds'] ?? 0);
    $duration = isset($input['duration_seconds']) ? (int) $input['duration_seconds'] : null;

    if ($vodItemId === '') {
        json_error('Missing vod_item_id.', 400);
    }

    $completed = ($duration !== null && $duration > 0 && $position >= $duration * 0.9) ? 1 : 0;

    // Not a DB-level unique-key upsert (see schema.sql's note on why) — a
    // plain select-then-write. Progress saves aren't so frequent or
    // concurrent that the tiny race window here matters in practice.
    $existing = db()->prepare(
        'SELECT id FROM vod_progress
         WHERE user_id = ? AND vod_item_id = ? AND vod_episode_id ' . ($vodEpisodeId !== null ? '= ?' : 'IS NULL') . '
         LIMIT 1'
    );
    $existing->execute($vodEpisodeId !== null ? [$user['id'], $vodItemId, $vodEpisodeId] : [$user['id'], $vodItemId]);
    $existingId = $existing->fetchColumn();

    if ($existingId) {
        db()->prepare(
            'UPDATE vod_progress SET position_seconds = ?, duration_seconds = ?, completed = ?, updated_at = NOW() WHERE id = ?'
        )->execute([$position, $duration, $completed, $existingId]);
    } else {
        db()->prepare(
            'INSERT INTO vod_progress (id, user_id, vod_item_id, vod_episode_id, position_seconds, duration_seconds, completed, updated_at)
             VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())'
        )->execute([$user['id'], $vodItemId, $vodEpisodeId, $position, $duration, $completed]);
    }

    json_response(['status' => 'saved']);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $vodItemId = $_GET['vod_item_id'] ?? '';
    $vodEpisodeId = $_GET['vod_episode_id'] ?? null;

    if ($vodItemId === '') {
        json_error('Missing vod_item_id.', 400);
    }

    $stmt = db()->prepare(
        'SELECT position_seconds, duration_seconds, completed FROM vod_progress
         WHERE user_id = ? AND vod_item_id = ? AND vod_episode_id ' . ($vodEpisodeId ? '= ?' : 'IS NULL') . '
         LIMIT 1'
    );
    $stmt->execute($vodEpisodeId ? [$user['id'], $vodItemId, $vodEpisodeId] : [$user['id'], $vodItemId]);
    $row = $stmt->fetch();

    json_response($row ?: ['position_seconds' => 0, 'duration_seconds' => null, 'completed' => 0]);
}

json_error('Method not allowed.', 405);

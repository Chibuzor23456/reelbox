<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';

function ingestion_state_get(string $jobName): ?array
{
    $stmt = db()->prepare('SELECT * FROM ingestion_state WHERE job_name = ? LIMIT 1');
    $stmt->execute([$jobName]);
    $row = $stmt->fetch();
    return $row ?: null;
}

function ingestion_state_set(string $jobName, array $fields): void
{
    $fields['last_run_at'] = date('Y-m-d H:i:s');

    if (ingestion_state_get($jobName) === null) {
        $columns = array_merge(['job_name' => $jobName], $fields);
        $cols = implode(', ', array_keys($columns));
        $placeholders = implode(', ', array_fill(0, count($columns), '?'));
        db()->prepare("INSERT INTO ingestion_state ($cols) VALUES ($placeholders)")
            ->execute(array_values($columns));
        return;
    }

    $sets = [];
    $values = [];
    foreach ($fields as $key => $value) {
        $sets[] = "$key = ?";
        $values[] = $value;
    }
    $values[] = $jobName;

    db()->prepare('UPDATE ingestion_state SET ' . implode(', ', $sets) . ' WHERE job_name = ?')
        ->execute($values);
}

/**
 * Generic chunked-cron-job runner, shared by every ingestion job in the
 * system (live playlist, VOD, and whatever comes next). When idle and
 * stale it calls $fetchFn to refresh the on-disk cache; otherwise it takes
 * one bounded slice of the cache, hands it to $processFn, and advances the
 * cursor — so no single invocation ever does unbounded work, regardless of
 * how large the underlying catalogue is.
 *
 * @param callable $fetchFn   (): int — fetches fresh candidates, writes them
 *                             to $cachePath, returns the total count.
 * @param callable $processFn (array $batchItems): int — processes one batch,
 *                             returns how many were actually ingested.
 */
function run_cached_batch_job(
    string $jobName,
    int $batchSize,
    int $refreshIntervalHours,
    string $cachePath,
    callable $fetchFn,
    callable $processFn,
): array {
    $state = ingestion_state_get($jobName);

    // 'error' is retried just like a stale 'idle' — a failed cron tick must
    // self-heal on the next one, not stay stuck until someone notices.
    $needsFullFetch = $state === null
        || $state['status'] === 'error'
        || ($state['status'] === 'idle' && (
            $state['last_full_run_at'] === null
            || strtotime($state['last_full_run_at']) < strtotime("-{$refreshIntervalHours} hours")
        ));

    try {
        if ($needsFullFetch) {
            ingestion_state_set($jobName, ['status' => 'fetching']);
            $total = $fetchFn();
            ingestion_state_set($jobName, [
                'status' => 'processing',
                'cursor_position' => 0,
                'total_items' => $total,
                'cache_path' => $cachePath,
                'last_error' => null,
            ]);
            $state = ingestion_state_get($jobName);
        }

        if ($state['status'] !== 'processing') {
            return [
                'status' => $state['status'],
                'processed' => 0,
                'cursor' => (int) $state['cursor_position'],
                'total' => (int) ($state['total_items'] ?? 0),
            ];
        }

        $cache = json_decode((string) file_get_contents($state['cache_path']), true) ?: [];
        $cursor = (int) $state['cursor_position'];
        $batchItems = array_slice($cache, $cursor, $batchSize);

        $processed = $processFn($batchItems);

        $total = (int) $state['total_items'];
        $newCursor = $cursor + count($batchItems);
        $done = count($batchItems) === 0 || $newCursor >= $total;

        ingestion_state_set($jobName, [
            'status' => $done ? 'idle' : 'processing',
            'cursor_position' => $done ? 0 : $newCursor,
            'last_full_run_at' => $done ? date('Y-m-d H:i:s') : $state['last_full_run_at'],
            'last_error' => null,
        ]);

        return [
            'status' => $done ? 'idle' : 'processing',
            'processed' => $processed,
            'cursor' => $done ? 0 : $newCursor,
            'total' => $total,
        ];
    } catch (Throwable $e) {
        ingestion_state_set($jobName, ['status' => 'error', 'last_error' => $e->getMessage()]);
        throw $e;
    }
}

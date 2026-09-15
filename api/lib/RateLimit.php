<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/Response.php';

/**
 * Simple sliding-window rate limiter, DB-backed since shared hosting can't
 * assume Redis/Memcached. Not perfectly race-free under heavy concurrency —
 * a good-enough brute-force deterrent, not a distributed rate limiter.
 *
 * Returns true (and records the attempt) if the caller is within budget;
 * false if they've exceeded it and should be rejected.
 */
function rate_limit_check(string $bucketKey, int $maxAttempts, int $windowSeconds): bool
{
    $db = db();
    $now = new DateTimeImmutable();

    $stmt = $db->prepare('SELECT window_start, attempts FROM rate_limits WHERE bucket_key = ? LIMIT 1');
    $stmt->execute([$bucketKey]);
    $row = $stmt->fetch();

    if ($row === false) {
        $db->prepare('INSERT INTO rate_limits (bucket_key, window_start, attempts) VALUES (?, ?, 1)')
            ->execute([$bucketKey, $now->format('Y-m-d H:i:s')]);
        return true;
    }

    $windowStart = new DateTimeImmutable($row['window_start']);
    $windowExpired = ($now->getTimestamp() - $windowStart->getTimestamp()) >= $windowSeconds;

    if ($windowExpired) {
        $db->prepare('UPDATE rate_limits SET window_start = ?, attempts = 1 WHERE bucket_key = ?')
            ->execute([$now->format('Y-m-d H:i:s'), $bucketKey]);
        return true;
    }

    if ((int) $row['attempts'] >= $maxAttempts) {
        return false;
    }

    $db->prepare('UPDATE rate_limits SET attempts = attempts + 1 WHERE bucket_key = ?')->execute([$bucketKey]);
    return true;
}

/** Rejects the request with 429 if the bucket is over budget. Call before
 * doing any real work on the endpoint. */
function rate_limit_or_reject(string $bucketKey, int $maxAttempts, int $windowSeconds): void
{
    if (!rate_limit_check($bucketKey, $maxAttempts, $windowSeconds)) {
        json_error('Too many attempts. Try again later.', 429);
    }
}

function client_ip(): string
{
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

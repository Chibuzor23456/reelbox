<?php

declare(strict_types=1);

/**
 * Fetches a URL server-side with the given headers (bypassing the browser
 * restrictions that make some channels unplayable directly: mixed content,
 * required User-Agent/Referer, missing CORS). Used by the relay endpoints
 * for channels flagged playback_mode = 'relay'.
 */
function relay_fetch(string $url, ?string $userAgent, ?string $referrer): array
{
    $ch = curl_init($url);
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 5,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_CONNECTTIMEOUT => 8,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_USERAGENT => $userAgent ?: 'Mozilla/5.0 (compatible; ReelBoxRelay/1.0)',
        CURLOPT_HEADER => true,
        // Some upstream IPTV sources gzip their playlist responses. Without
        // this, curl requests identity encoding but a server can still
        // compress anyway — this makes curl both advertise support for and
        // transparently decode gzip/deflate/br, whatever the server sends.
        CURLOPT_ENCODING => '',
    ];
    if ($referrer) {
        $opts[CURLOPT_REFERER] = $referrer;
    }
    curl_setopt_array($ch, $opts);

    $response = curl_exec($ch);
    $errno = curl_errno($ch);
    $error = curl_error($ch);

    if ($errno !== 0 || $response === false) {
        curl_close($ch);
        return ['ok' => false, 'error' => $error, 'body' => null, 'contentType' => null, 'httpCode' => 0];
    }

    $headerSize = (int) curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    curl_close($ch);

    return [
        'ok' => true,
        'body' => substr($response, $headerSize),
        'contentType' => $contentType,
        'httpCode' => $httpCode,
    ];
}

function relay_encode_url(string $url): string
{
    return rtrim(strtr(base64_encode($url), '+/', '-_'), '=');
}

function relay_decode_url(string $encoded): string
{
    $remainder = strlen($encoded) % 4;
    if ($remainder > 0) {
        $encoded .= str_repeat('=', 4 - $remainder);
    }
    $decoded = base64_decode(strtr($encoded, '-_', '+/'), true);
    return $decoded !== false ? $decoded : '';
}

/** Resolves a (possibly relative) HLS manifest URI against the manifest's own URL. */
function relay_resolve_url(string $base, string $ref): string
{
    if (preg_match('#^[a-zA-Z][a-zA-Z0-9+.-]*://#', $ref)) {
        return $ref;
    }

    $baseParts = parse_url($base);
    if ($baseParts === false) {
        return $ref;
    }

    $scheme = $baseParts['scheme'] ?? 'https';
    $host = $baseParts['host'] ?? '';
    $port = isset($baseParts['port']) ? ':' . $baseParts['port'] : '';
    $authority = "$scheme://$host$port";

    if (str_starts_with($ref, '//')) {
        return "$scheme:$ref";
    }

    if (str_starts_with($ref, '/')) {
        return $authority . $ref;
    }

    $basePath = $baseParts['path'] ?? '/';
    if ($basePath === '') {
        $basePath = '/';
    }
    $baseDir = substr($basePath, 0, strrpos($basePath, '/') + 1);
    $combined = $baseDir . $ref;

    $segments = explode('/', $combined);
    $resolved = [];
    foreach ($segments as $segment) {
        if ($segment === '.' || $segment === '') {
            continue;
        }
        if ($segment === '..') {
            array_pop($resolved);
            continue;
        }
        $resolved[] = $segment;
    }

    return $authority . '/' . implode('/', $resolved);
}

function relay_build_playlist_url(string $channelId, string $targetUrl): string
{
    return '/channels/relay-playlist.php?id=' . urlencode($channelId) . '&url=' . relay_encode_url($targetUrl);
}

function relay_build_segment_url(string $channelId, string $targetUrl): string
{
    return '/channels/relay-segment.php?id=' . urlencode($channelId) . '&url=' . relay_encode_url($targetUrl);
}

/**
 * Rewrites every URI in an HLS manifest (nested variant playlists, segments,
 * encryption keys) to route back through our relay endpoints, so the
 * browser never talks to the original third-party host directly.
 */
function relay_rewrite_playlist(string $body, string $baseUrl, string $channelId): string
{
    $lines = preg_split('/\r\n|\r|\n/', $body);
    $out = [];

    foreach ($lines as $line) {
        $trimmed = rtrim($line);

        if ($trimmed === '') {
            $out[] = $trimmed;
            continue;
        }

        if (str_starts_with($trimmed, '#EXT-X-KEY') || str_starts_with($trimmed, '#EXT-X-MAP')) {
            $out[] = preg_replace_callback(
                '/URI="([^"]+)"/',
                function ($m) use ($baseUrl, $channelId) {
                    $resolved = relay_resolve_url($baseUrl, $m[1]);
                    return 'URI="' . relay_build_segment_url($channelId, $resolved) . '"';
                },
                $trimmed
            );
            continue;
        }

        if (str_starts_with($trimmed, '#')) {
            $out[] = $trimmed;
            continue;
        }

        $resolved = relay_resolve_url($baseUrl, $trimmed);
        $out[] = str_contains($resolved, '.m3u8')
            ? relay_build_playlist_url($channelId, $resolved)
            : relay_build_segment_url($channelId, $resolved);
    }

    return implode("\n", $out);
}

function current_origin(): string
{
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $port443 = ($_SERVER['SERVER_PORT'] ?? '') === '443';
    $scheme = ($https || $port443) ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

    return "$scheme://$host";
}

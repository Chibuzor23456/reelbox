<?php

declare(strict_types=1);

/**
 * Parses an IPTV-org style extended M3U playlist into normalized channel
 * arrays. Handles #EXTINF attributes, #EXTVLCOPT header hints, and skips
 * anything that isn't a well-formed http(s) entry.
 */
function m3u_parse(string $raw): array
{
    $lines = preg_split('/\r\n|\r|\n/', $raw);
    $channels = [];
    $pending = null;

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }

        if (str_starts_with($line, '#EXTINF:')) {
            $pending = m3u_parse_extinf($line);
            continue;
        }

        if (str_starts_with($line, '#EXTVLCOPT:')) {
            if ($pending !== null) {
                m3u_apply_vlcopt($pending, $line);
            }
            continue;
        }

        if (str_starts_with($line, '#')) {
            continue;
        }

        if ($pending !== null) {
            if (str_starts_with($line, 'http://') || str_starts_with($line, 'https://')) {
                $pending['stream_url'] = $line;
                $channels[] = $pending;
            }
            $pending = null;
        }
    }

    return $channels;
}

function m3u_parse_extinf(string $line): array
{
    $body = substr($line, strlen('#EXTINF:'));

    $lastComma = strrpos($body, ',');
    $attrPart = $lastComma !== false ? substr($body, 0, $lastComma) : $body;
    $name = $lastComma !== false ? trim(substr($body, $lastComma + 1)) : '';

    $attrs = [];
    if (preg_match_all('/([a-zA-Z0-9_-]+)="([^"]*)"/', $attrPart, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $attrs[strtolower($match[1])] = $match[2];
        }
    }

    $tvgId = $attrs['tvg-id'] ?? null;
    $country = null;
    if ($tvgId !== null && preg_match('/\.([a-z]{2})@/i', $tvgId, $countryMatch)) {
        $country = strtoupper($countryMatch[1]);
    }

    $category = null;
    if (isset($attrs['group-title']) && $attrs['group-title'] !== '') {
        $category = trim(explode(';', $attrs['group-title'])[0]);
    }

    return [
        'name' => $name !== '' ? $name : ($tvgId ?? 'Unknown channel'),
        'tvg_id' => $tvgId,
        'logo_url' => $attrs['tvg-logo'] ?? null,
        'category' => $category,
        'country' => $country,
        'required_user_agent' => $attrs['http-user-agent'] ?? null,
        'required_referrer' => $attrs['http-referrer'] ?? null,
    ];
}

function m3u_apply_vlcopt(array &$pending, string $line): void
{
    $body = substr($line, strlen('#EXTVLCOPT:'));
    [$key, $value] = array_pad(explode('=', $body, 2), 2, null);
    $key = strtolower(trim((string) $key));
    $value = trim((string) $value);

    if ($value === '') {
        return;
    }

    if ($key === 'http-user-agent') {
        $pending['required_user_agent'] = $value;
    } elseif ($key === 'http-referrer' || $key === 'http-referer') {
        $pending['required_referrer'] = $value;
    }
}

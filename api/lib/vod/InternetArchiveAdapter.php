<?php

declare(strict_types=1);

require_once __DIR__ . '/../HttpClient.php';

// Only items with an explicit public-domain licenseurl are ever ingested.
// Plain "creativecommons.org/licenses/by*" (attribution/non-commercial/
// share-alike) is deliberately excluded — those carry real usage
// restrictions this codebase doesn't track or enforce, so the safe default
// is to skip them rather than guess.
const IA_LICENSE_ALLOWLIST = 'publicdomain';

/** IA item descriptions are frequently raw HTML (<div>, <a href>, <br/> —
 * often with attribution links back to a source site) — strip that down to
 * plain text rather than showing markup literally in a synopsis field. */
function ia_clean_synopsis(?string $raw): ?string
{
    if ($raw === null || trim($raw) === '') {
        return null;
    }

    $text = html_entity_decode(strip_tags($raw), ENT_QUOTES | ENT_HTML5);
    $text = preg_replace('/[ \t]+/', ' ', $text);
    $text = trim(preg_replace('/\n{3,}/', "\n\n", $text));

    return $text !== '' ? $text : null;
}

function ia_search(string $query, int $rows, array $fields): array
{
    $qs = http_build_query(['q' => $query, 'rows' => $rows, 'output' => 'json']);
    foreach ($fields as $field) {
        $qs .= '&fl[]=' . urlencode($field);
    }

    $result = http_get_json('https://archive.org/advancedsearch.php?' . $qs);
    return $result['response']['docs'] ?? [];
}

/**
 * Picks the primary playable video file from an IA item and re-confirms
 * its license (the search index can lag reality). Shared by both the movie
 * and series-episode resolvers, since both need the same per-item lookup.
 */
function ia_resolve_playable(string $identifier): ?array
{
    $data = http_get_json('https://archive.org/metadata/' . rawurlencode($identifier));
    if ($data === null || empty($data['files'])) {
        return null;
    }

    $metadata = $data['metadata'] ?? [];
    $licenseUrl = $metadata['licenseurl'] ?? '';
    if (!is_string($licenseUrl) || !str_contains($licenseUrl, IA_LICENSE_ALLOWLIST)) {
        return null;
    }

    $videoFile = null;
    $thumbFile = null;
    foreach ($data['files'] as $file) {
        $name = $file['name'] ?? '';
        if ($videoFile === null && ($file['source'] ?? '') === 'original' && preg_match('/\.(mp4|m4v|ogv|webm)$/i', $name)) {
            $videoFile = $file;
        }
        // IA generates one canonical "Item Tile" thumbnail per item — real
        // artwork without needing TMDB configured at all.
        if (($file['format'] ?? '') === 'Item Tile' || $name === '__ia_thumb.jpg') {
            $thumbFile = $file;
        }
    }
    if ($videoFile === null) {
        return null;
    }

    $title = $metadata['title'] ?? $identifier;
    $description = $metadata['description'] ?? null;
    $description = is_array($description) ? implode("\n", $description) : $description;

    return [
        'title' => is_array($title) ? ($title[0] ?? $identifier) : (string) $title,
        'synopsis' => ia_clean_synopsis($description),
        'year' => ia_extract_year($metadata),
        'runtime_minutes' => isset($videoFile['length']) ? (int) round(((float) $videoFile['length']) / 60) : null,
        'playback_url' => 'https://archive.org/download/' . rawurlencode($identifier) . '/' . rawurlencode($videoFile['name']),
        'thumbnail_url' => $thumbFile !== null
            ? 'https://archive.org/download/' . rawurlencode($identifier) . '/' . rawurlencode($thumbFile['name'])
            : null,
    ];
}

function ia_extract_year(array $metadata): ?int
{
    $year = $metadata['year'] ?? null;
    if (is_array($year)) {
        $year = $year[0] ?? null;
    }
    if ($year === null) {
        return null;
    }

    $digits = preg_replace('/\D/', '', (string) $year);
    return $digits !== '' ? (int) $digits : null;
}

// -----------------------------------------------------------------------
// Movies adapter
// -----------------------------------------------------------------------

function ia_movies_discover(): array
{
    $collections = array_filter(array_map('trim', explode(',', env('IA_MOVIE_COLLECTIONS', 'feature_films'))));
    $rows = (int) env('IA_ROWS_PER_COLLECTION', '500');

    $candidates = [];
    foreach ($collections as $collection) {
        $query = "collection:$collection AND mediatype:movies AND licenseurl:*" . IA_LICENSE_ALLOWLIST . '*';
        foreach (ia_search($query, $rows, ['identifier', 'title', 'year']) as $doc) {
            $id = $doc['identifier'] ?? null;
            if ($id) {
                $candidates[$id] = ['identifier' => $id];
            }
        }
    }

    return array_values($candidates);
}

function ia_movies_resolve(array $candidate): ?array
{
    $details = ia_resolve_playable($candidate['identifier']);
    if ($details === null) {
        return null;
    }

    return [
        'type' => 'movie',
        'source_identifier' => $candidate['identifier'],
        'title' => $details['title'],
        'synopsis' => $details['synopsis'],
        'year' => $details['year'],
        'runtime_minutes' => $details['runtime_minutes'],
        'playback_url' => $details['playback_url'],
        'thumbnail_url' => $details['thumbnail_url'],
    ];
}

// -----------------------------------------------------------------------
// Series adapter — groups items whose titles carry a standard SxxExx
// episode marker (the same convention tools like Sonarr/Plex parse) into
// Series -> Seasons -> Episodes. Items without that marker simply aren't
// series candidates; nothing is guessed or fabricated.
// -----------------------------------------------------------------------

function ia_series_discover(): array
{
    $maxSeason = (int) env('IA_SERIES_SEASON_SCAN', '6');
    $rows = (int) env('IA_SERIES_ROWS_PER_SEASON', '300');

    $seen = [];
    $docs = [];
    for ($s = 1; $s <= $maxSeason; $s++) {
        $token = 'S' . str_pad((string) $s, 2, '0', STR_PAD_LEFT);
        $query = "mediatype:movies AND licenseurl:*" . IA_LICENSE_ALLOWLIST . "* AND title:($token)";
        foreach (ia_search($query, $rows, ['identifier', 'title']) as $doc) {
            $id = $doc['identifier'] ?? null;
            if ($id && !isset($seen[$id])) {
                $seen[$id] = true;
                $docs[] = $doc;
            }
        }
    }

    $series = [];
    foreach ($docs as $doc) {
        $parsed = ia_parse_episode_title((string) ($doc['title'] ?? ''));
        if ($parsed === null) {
            continue;
        }

        $key = $parsed['series_key'];
        $series[$key]['series_key'] ??= $key;
        $series[$key]['series_title'] ??= $parsed['series_title'];
        $series[$key]['seasons'][$parsed['season_number']]['season_number'] = $parsed['season_number'];
        $series[$key]['seasons'][$parsed['season_number']]['episodes'][$parsed['episode_number']] = [
            'episode_number' => $parsed['episode_number'],
            'episode_title' => $parsed['episode_title'],
            'identifier' => $doc['identifier'],
        ];
    }

    return array_values(array_map('ia_finalize_series_candidate', $series));
}

function ia_finalize_series_candidate(array $series): array
{
    ksort($series['seasons']);
    foreach ($series['seasons'] as &$season) {
        ksort($season['episodes']);
        $season['episodes'] = array_values($season['episodes']);
    }
    unset($season);
    $series['seasons'] = array_values($series['seasons']);

    return $series;
}

function ia_parse_episode_title(string $title): ?array
{
    if (!preg_match('/^(.*?)[\s\-:]*S0*(\d{1,2})\s*E0*(\d{1,3})\b[\s\-:.]*(.*)$/i', trim($title), $m)) {
        return null;
    }

    $seriesTitle = trim($m[1], " \t-:([");
    if ($seriesTitle === '') {
        return null;
    }

    $episodeTitle = trim(preg_replace('/\.(mp4|mkv|avi)\s*\d*$/i', '', $m[4]), " \t-:.()[]");

    return [
        'series_key' => strtolower((string) preg_replace('/[^a-z0-9]+/i', '-', $seriesTitle)),
        'series_title' => $seriesTitle,
        'season_number' => (int) $m[2],
        'episode_number' => (int) $m[3],
        'episode_title' => $episodeTitle !== '' ? $episodeTitle : null,
    ];
}

function ia_series_resolve(array $candidate): ?array
{
    $resolvedSeasons = [];
    $seriesThumbnail = null;

    foreach ($candidate['seasons'] as $season) {
        $episodes = [];
        foreach ($season['episodes'] as $episode) {
            $details = ia_resolve_playable($episode['identifier']);
            if ($details === null) {
                continue; // skip just this episode, not the whole series
            }
            // Use the first episode with a thumbnail as the series' own —
            // there's no single "series" item on IA to pull one from.
            if ($seriesThumbnail === null && $details['thumbnail_url'] !== null) {
                $seriesThumbnail = $details['thumbnail_url'];
            }
            $episodes[] = [
                'episode_number' => $episode['episode_number'],
                'title' => $episode['episode_title'],
                'synopsis' => $details['synopsis'],
                'duration_minutes' => $details['runtime_minutes'],
                'playback_url' => $details['playback_url'],
            ];
        }
        if ($episodes !== []) {
            $resolvedSeasons[] = ['season_number' => $season['season_number'], 'episodes' => $episodes];
        }
    }

    if ($resolvedSeasons === []) {
        return null;
    }

    return [
        'type' => 'series',
        'source_identifier' => $candidate['series_key'],
        'title' => $candidate['series_title'],
        'synopsis' => null,
        'year' => null,
        'thumbnail_url' => $seriesThumbnail,
        'seasons' => $resolvedSeasons,
    ];
}

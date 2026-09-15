<?php

declare(strict_types=1);

/** Minimal GET-JSON helper shared by every ingestion adapter. */
function http_get_json(string $url, array $curlOpts = []): ?array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, $curlOpts + [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_USERAGENT => 'ReelBoxIngestor/1.0',
    ]);
    $body = curl_exec($ch);
    $ok = curl_errno($ch) === 0;
    curl_close($ch);

    if (!$ok || $body === false) {
        return null;
    }

    $data = json_decode($body, true);
    return is_array($data) ? $data : null;
}

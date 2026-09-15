# REELBOX — IPTV Live TV Ingestion, Discovery & EPG PRD

**Product:** REELBOX  
**Scope:** Live TV, IPTV ingestion, channel discovery, categories, countries, languages, stream validation, EPG and TV Guide  
**Primary source:** IPTV-org  
**Status:** Implementation-ready

## 1. Executive Summary

REELBOX must not treat IPTV-org's master `index.m3u` as a flat list of channels.

IPTV-org provides structured channel metadata, streams, categories, countries, languages, regions, logos and guide information. Its public playlists are generated from its database and can be grouped by category, country and language. Its API separately exposes channels, streams and guides.

REELBOX should therefore use a proper ingestion and normalization layer:

```text
IPTV-org
   ↓
Ingestion
   ↓
Normalization
   ↓
Deduplication
   ↓
Stream Health
   ↓
EPG Matching
   ↓
REELBOX Database
   ↓
REELBOX API
   ↓
Frontend / Player
```

The goal is a modern streaming-TV experience rather than an M3U playlist viewer.

## 2. Product Goals

REELBOX Live TV must support:

- Nigerian live TV
- International live TV
- Sports
- News
- Entertainment
- Movies
- Kids
- Music
- Documentary
- General
- Country browsing
- Region browsing
- Language browsing
- Search
- Channel details
- EPG / TV Guide
- Now Playing
- Next Programme
- Favorites
- Recently Watched
- Live playback
- Stream health
- Admin ingestion controls

The system must distinguish between:

1. Channel metadata
2. Stream availability
3. EPG/programme metadata

These are related but separate datasets.

## 3. IPTV-org Source Architecture

Primary master playlist:

`https://iptv-org.github.io/iptv/index.m3u`

Structured API sources:

`https://iptv-org.github.io/api/channels.json`

`https://iptv-org.github.io/api/streams.json`

`https://iptv-org.github.io/api/guides.json`

`https://iptv-org.github.io/api/categories.json`

IPTV-org also provides grouped playlists such as:

- `index.category.m3u`
- `index.country.m3u`
- `index.language.m3u`
- country playlists
- category playlists
- language playlists
- region/subdivision playlists
- source playlists

Public playlists are generated automatically and select the best available option for each channel; raw playlists are different and should not be the normal REELBOX UI source.

REELBOX should ingest structured data into its own database instead of parsing the master M3U on every page load.

## 4. Core Architecture

```text
                         IPTV-ORG
                            │
       ┌────────────────────┼────────────────────┐
       │                    │                    │
   CHANNEL API          STREAM API           GUIDE API
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ↓
                    REELBOX INGESTION
                            ↓
                     NORMALIZATION
                            ↓
                    DEDUPLICATION
                            ↓
                    STREAM HEALTH
                            ↓
                      EPG MATCHING
                            ↓
                       MYSQL
                            ↓
                    REELBOX REST API
                            ↓
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
     Live TV             TV Guide            Search
        ↓                   ↓                   ↓
   Categories           Now/Next           Filters
   Countries             Schedule           Country
   Languages                                Category
        ↓
                     REELBOX PLAYER
                            ↓
                 Authorized source stream
```

## 5. Channel Data Model

Minimum fields:

```text
id
source
source_channel_id
name
alternative_names
network
country_code
country_name
region
language_codes
categories
logo_url
official_website
is_nsfw
status
created_at
updated_at
```

Optional:

```text
launch_date
closed_date
replacement_channel_id
owner
description
```

## 6. Stream Data Model

Streams must be stored separately from channels.

```text
id
channel_id
source
source_stream_id
feed_id
title
stream_url
referrer
user_agent
quality
availability_label
health_status
last_checked_at
last_success_at
failure_count
created_at
updated_at
```

A channel existing in IPTV-org does not guarantee that a playable stream is currently available.

## 7. EPG Data Model

Guide source:

```text
id
channel_id
feed_id
guide_source
site
site_id
site_name
language
guide_url
format
created_at
updated_at
```

Programme:

```text
id
channel_id
feed_id
programme_id
title
description
start_time
end_time
category
icon
language
created_at
updated_at
```

## 8. Category Architecture

Preserve IPTV-org categories, including:

- Sports
- News
- Entertainment
- Movies
- Series
- Kids
- Music
- Documentary
- General
- Business
- Education
- Culture
- Comedy
- Cooking
- Travel
- Science
- Weather
- Religious
- Classic
- Animation
- Auto

The category list should remain source-driven and extensible.

Important: a channel categorized as `Series` by IPTV-org is still a **live channel category**. It does not mean REELBOX has a VOD series with seasons and episodes.

## 9. Country Architecture

Country is a first-class discovery dimension.

Example:

```text
Nigeria
Ghana
South Africa
United Kingdom
United States
Canada
France
Germany
India
...
```

The complete country list should come from source metadata.

## 10. Nigeria-First Live TV

Nigeria should receive prominent placement without removing international channels.

Recommended landing:

```text
LIVE TV

Featured

🇳🇬 Nigeria
   News
   Sports
   Entertainment
   General
   Music
   Religious
   Education

🌍 International
   Sports
   News
   Entertainment
   Movies
   Kids
   Music
   Documentary

Browse All
```

Nigeria is a default discovery priority, not a restriction.

## 11. International Discovery

Users must be able to browse:

- Countries
- Regions
- Languages
- Categories
- Search

The international catalogue must remain accessible.

## 12. Language Discovery

Support source-provided broadcast languages.

Example:

```text
English
French
Arabic
Spanish
Portuguese
German
Italian
Chinese
...
```

Do not infer language from a channel name when reliable metadata exists.

## 13. Multi-Dimensional Filtering

The backend must support intersections such as:

```text
Country: Nigeria
Category: News
Language: English
```

and:

```text
Country: Nigeria
Category: Sports
```

and:

```text
Language: English
Category: Sports
```

Static IPTV-org playlists are generally grouped one dimension at a time. REELBOX should perform intersections using its normalized database/API.

## 14. Stream Health

Stream states:

```text
Healthy
Degraded
Unavailable
Unknown
Geo-blocked
Unsupported
```

Health checks may verify:

- URL resolution
- HTTP/media response
- supported media type
- initial media availability
- short availability window

Do not continuously proxy full video through REELBOX merely for health checks.

## 15. Geo-Blocking

Do not bypass geo-restrictions.

If a stream is known to be unavailable in a user's region, REELBOX should show an appropriate unavailable state instead of attempting to circumvent the restriction.

## 16. Playback

Playback flow:

```text
REELBOX API
     ↓
Select usable stream
     ↓
Return playback configuration
     ↓
Browser player
     ↓
Authorized source stream
```

The backend should not unnecessarily proxy video.

Use HLS.js or native playback according to browser capability and source format.

## 17. Stream Selection

When several streams exist, prefer:

1. Healthy streams
2. Compatible streams
3. Best available quality
4. Appropriate feed
5. Lowest recent failure rate

Allow fallback when the preferred stream fails.

## 18. Channel Deduplication

Deduplicate using:

1. Stable IPTV-org channel ID
2. Feed ID where feeds are genuinely distinct
3. Controlled normalized fallback identifiers

The same channel must not appear as multiple visible channels merely because it exists in several source playlists.

## 19. Feed Handling

A channel may have multiple feeds.

Do not collapse genuinely different feeds automatically.

Feed-level records should remain available to the ingestion and admin layers.

## 20. EPG Matching

Prefer stable identifiers:

```text
channel_id
feed_id
site_id
```

Do not rely on approximate channel-name matching when stable identifiers exist.

## 21. Live TV Home

Recommended:

```text
LIVE TV

[ Search channels ]

Featured Live
[Card] [Card] [Card] [Card]

🇳🇬 Nigerian TV
[Card] [Card] [Card] [Card]

⚽ Sports
[Card] [Card] [Card] [Card]

📰 News
[Card] [Card] [Card] [Card]

🎬 Movies
[Card] [Card] [Card] [Card]

🌍 International
[Card] [Card] [Card] [Card]
```

Mobile uses horizontal rails; desktop can use richer grids.

## 22. Category Pages

Example:

```text
Sports

[ Search ]

Featured Sports
[Cards]

All Sports Channels
[Grid]
```

Apply the same structure to News, Entertainment, Movies, Kids, Music, Documentary and other categories.

## 23. Country Pages

Example:

```text
🇳🇬 Nigeria

Featured

News
Sports
Entertainment
General
Music
Religious
Education

All Nigerian Channels
```

Only source-supported channels should appear.

## 24. Search

Search:

- Channel name
- Alternative names
- Network
- Country
- Category
- Language

Results must distinguish relevant channel metadata.

## 25. Channel Detail

Display:

```text
Logo
Channel Name
Country
Category
Language

NOW PLAYING
Programme

NEXT
Programme

[ WATCH LIVE ]

Description / official website where available
```

Do not expose raw stream URLs to normal users.

## 26. EPG / TV Guide

The TV Guide should support:

- Current programme
- Next programme
- Programme timeline
- Date navigation
- Programme details
- Channel navigation
- Watch channel

Desktop example:

```text
             12:00      13:00      14:00
BBC          Programme  Programme  Programme
CNN          Programme  Programme  Programme
ESPN         Programme  Programme  Programme
```

Mobile should use a dedicated compact layout:

```text
TV GUIDE

Today

Channel A
NOW — Programme
13:00 — Programme
14:00 — Programme

Channel B
NOW — Programme
13:30 — Programme
14:30 — Programme
```

## 27. Favorites

Users can favorite channels.

Suggested table:

```text
user_channel_favorites
```

Support add, remove and My Channels.

## 28. Recently Watched

Track:

```text
user_id
channel_id
last_watched_at
```

For Live TV use “Recently Watched”; for VOD use “Continue Watching”.

## 29. Sports

Sports is a discovery category, not a guarantee that every premium sporting event is available.

REELBOX may provide subcategories when reliable metadata supports them:

- Football
- Basketball
- Tennis
- Motorsport
- Combat Sports
- Other

Do not promise a particular live match merely because a sports channel exists.

## 30. News

Provide useful discovery sections such as:

- Nigerian News
- International News
- Business News
- World News
- Weather

Only classify using reliable source metadata.

## 31. Admin

Admin navigation:

```text
Live TV
 ├── Channels
 ├── Streams
 ├── Categories
 ├── Countries
 ├── Languages
 ├── EPG
 ├── Ingestion Jobs
 └── Health
```

Admin should be able to inspect why a channel is present, unavailable or missing EPG.

## 32. Ingestion Jobs

Fields:

```text
id
source
job_type
status
started_at
completed_at
records_seen
records_created
records_updated
records_removed
records_failed
error_summary
```

Statuses:

```text
Queued
Running
Completed
Completed with warnings
Failed
```

## 33. Shared Job-State Service

Extract shared job-state behavior from `PlaylistIngestor.php`.

Concept:

```text
JobStateService
 ├── start()
 ├── updateProgress()
 ├── addWarning()
 ├── addError()
 ├── complete()
 └── fail()
```

Then:

```text
PlaylistIngestor → JobStateService
VODIngestor      → JobStateService
EPGIngestor      → JobStateService
```

## 34. Ingestion Pipeline

```text
1. Fetch
2. Parse
3. Normalize
4. Deduplicate
5. Validate
6. Evaluate stream health
7. Upsert
8. Deactivate stale records
9. Match/update EPG
10. Complete job
```

A source failure must never wipe the existing catalogue.

## 35. Refresh Strategy

IPTV-org public playlists are generated daily.

REELBOX should support configurable jobs:

- Metadata refresh: daily or configurable
- Stream health: more frequent
- EPG refresh: based on guide freshness
- Manual admin refresh: available

Do not repeatedly download huge datasets unnecessarily.

## 36. Stale Data

Use states:

```text
Active
Possibly stale
Stale
Deactivated
```

Do not immediately hard-delete channels after a single failed source refresh.

## 37. Source Attribution

Store:

```text
source_name
source_channel_id
source_stream_id
source_last_seen_at
```

This is important for debugging, provenance and future source adapters.

## 38. API

Suggested consumer endpoints:

```text
GET /api/live/channels
GET /api/live/channels/{id}
GET /api/live/categories
GET /api/live/countries
GET /api/live/languages
GET /api/live/regions
GET /api/live/search
GET /api/live/featured
GET /api/live/recent
GET /api/live/favorites
GET /api/live/channels/{id}/epg
GET /api/live/guide
POST /api/live/favorites
DELETE /api/live/favorites/{id}
```

Admin:

```text
GET /api/admin/live/ingestion
POST /api/admin/live/ingestion/run
GET /api/admin/live/health
GET /api/admin/live/streams
GET /api/admin/live/epg
```

## 39. API Filtering

Examples:

```text
GET /api/live/channels?country=NG
```

```text
GET /api/live/channels?category=sports
```

```text
GET /api/live/channels?country=NG&category=news
```

```text
GET /api/live/channels?language=eng&category=sports
```

Filtering should happen server-side.

## 40. Featured Channels

Featured channels may be selected using:

- Health
- Availability
- Country relevance
- Category
- User preferences
- Admin/editorial selection
- Popularity data where available

Admin should be able to pin featured channels.

## 41. Database Indexing

Recommended indexes:

```text
channels.source
channels.source_channel_id
channels.country_code
channels.status
streams.channel_id
streams.health_status
streams.last_checked_at
epg_programmes.channel_id
epg_programmes.start_time
epg_programmes.end_time
```

Use an appropriate indexed strategy for category/language data.

## 42. Performance

Do not parse the external master playlist on every frontend request.

Use:

```text
External data
→ Scheduled ingestion
→ MySQL
→ REST API
→ Frontend
```

Use pagination, caching, indexed queries, lazy images and server-side filtering.

## 43. Responsive Requirements

Live TV must follow the full REELBOX responsive specification.

Mobile:

- Bottom navigation
- Horizontal channel rails
- Compact cards
- Mobile EPG
- Full-width player
- Bottom-sheet filters
- Touch-friendly controls

Tablet:

- Larger grids
- Expanded category controls
- Wider player

Desktop:

- Full navigation
- Rich grid
- EPG side panel
- Expanded metadata

Large desktop:

- Maximum content width
- Balanced spacing
- No stretched cards

## 44. Error Recovery

If a selected stream fails:

1. Attempt configured fallback.
2. If unavailable, show a clear error.
3. Allow retry.
4. Avoid repeatedly hammering the failed URL.
5. Record the failure for health monitoring.

Example:

```text
This channel is temporarily unavailable.

[ Retry ]

Try another channel
```

## 45. Security

Validate all:

- Source identifiers
- Channel IDs
- Query parameters
- Admin actions
- Ingestion payloads

Do not allow arbitrary users to submit URLs that cause the backend to fetch arbitrary remote resources.

Protect ingestion and health endpoints with admin authorization.

## 46. Legal / Rights

IPTV-org describes itself as a collection of publicly available IPTV channels, but public availability does not automatically establish redistribution rights for every use case.

REELBOX must not:

- bypass DRM
- bypass authentication
- bypass paywalls
- bypass geo-restrictions
- scrape protected services
- redistribute streams where REELBOX lacks permission

Use streams only in a manner permitted by their source and applicable rights.

## 47. Failure Scenarios

Handle:

- IPTV-org unavailable
- API timeout
- malformed M3U
- API schema changes
- empty playlist
- duplicate channels
- duplicate streams
- missing logo
- missing category
- missing country
- missing language
- missing EPG
- geo-blocked stream
- dead stream
- invalid URL
- removed channel

A source failure must not erase the existing catalogue.

## 48. Admin Diagnostics

Admin should see:

```text
Channel
Source
Country
Category
Stream count
Healthy streams
Unavailable streams
EPG available
Last checked
Last successful check
```

This allows the team to diagnose why a channel exists but does not play.

## 49. Definition of Done

- [ ] Master IPTV-org source ingested.
- [ ] Channel metadata normalized.
- [ ] Stream metadata stored separately.
- [ ] EPG metadata stored separately.
- [ ] Channels deduplicated.
- [ ] Categories preserved.
- [ ] Countries preserved.
- [ ] Languages preserved.
- [ ] Regions supported where available.
- [ ] Nigeria has a dedicated discovery experience.
- [ ] International channels remain available.
- [ ] Sports is a proper category.
- [ ] News is a proper category.
- [ ] Entertainment is a proper category.
- [ ] Movies is a proper category.
- [ ] Kids is a proper category.
- [ ] Music is a proper category.
- [ ] Documentary is a proper category.
- [ ] Search works.
- [ ] Country/category intersections work.
- [ ] Stream health is tracked.
- [ ] Failed streams are not presented as reliably playable.
- [ ] Fallback streams work where available.
- [ ] EPG uses stable identifiers.
- [ ] Mobile EPG exists.
- [ ] Desktop EPG exists.
- [ ] Live playback works through authorized source streams.
- [ ] Favorites work.
- [ ] Recently Watched works.
- [ ] Admin can monitor ingestion.
- [ ] Admin can monitor stream health.
- [ ] Admin can trigger ingestion.
- [ ] Source attribution is retained.
- [ ] Stale records are handled safely.
- [ ] API filtering supports country/category/language.
- [ ] Arbitrary server-side URL fetching is prevented.
- [ ] Responsive QA passes.
- [ ] Source failures cannot wipe the catalogue.

## 50. VOD Separation Rule

This PRD covers **Live TV**.

REELBOX VOD remains a separate content system.

Do not confuse IPTV-org's live-channel categories `Movies` or `Series` with a VOD catalogue.

A live channel categorized as Series does not create:

```text
Series
 ├── Season 1
 │    ├── Episode 1
 │    └── Episode 2
```

VOD Movies and VOD Series require their own authorized sources and ingestion adapters.

## 51. Final Architecture Principle

> **REELBOX must use IPTV-org as structured source data, not as a raw playlist dumped directly into the interface.**

The resulting experience should make Nigeria prominent, preserve the international catalogue, expose real category/country/language discovery, validate streams, provide EPG, and remain extensible for additional authorized IPTV sources.

## Official References

1. IPTV-org — Playlist documentation  
https://github.com/iptv-org/iptv/blob/master/docs/playlists.md

2. IPTV-org — API  
https://github.com/iptv-org/api

3. IPTV-org — Custom playlist intersections discussion  
https://github.com/orgs/iptv-org/discussions/1617

-- ReelBox V1 schema
-- Run once against an empty database (e.g. via Hostinger's phpMyAdmin,
-- or `mysql -u ... -p reelbox < schema.sql`).

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- Identity & access
-- ---------------------------------------------------------------------

CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    status ENUM('pending', 'active', 'suspended', 'deleted') NOT NULL DEFAULT 'pending',
    avatar_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invitations (
    id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(190) NOT NULL,
    name VARCHAR(120) NULL,
    token_hash CHAR(64) NOT NULL,
    invited_by CHAR(36) NULL,
    status ENUM('pending', 'accepted', 'revoked', 'expired') NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    UNIQUE KEY uq_invitations_token_hash (token_hash),
    KEY idx_invitations_email (email),
    CONSTRAINT fk_invitations_invited_by FOREIGN KEY (invited_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sessions (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token_hash CHAR(64) NOT NULL,
    user_agent VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    UNIQUE KEY uq_sessions_token_hash (token_hash),
    KEY idx_sessions_user_id (user_id),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE legal_acceptances (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    document_type ENUM('terms', 'privacy') NOT NULL,
    version VARCHAR(20) NOT NULL,
    accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    KEY idx_legal_acceptances_user_id (user_id),
    CONSTRAINT fk_legal_acceptances_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Live TV
-- ---------------------------------------------------------------------

CREATE TABLE channels (
    id CHAR(36) NOT NULL PRIMARY KEY,
    tvg_id VARCHAR(190) NULL,
    name VARCHAR(190) NOT NULL,
    logo_url VARCHAR(500) NULL,
    country VARCHAR(80) NULL,
    language VARCHAR(80) NULL,
    category VARCHAR(80) NULL,
    stream_url VARCHAR(1000) NOT NULL,
    stream_url_hash CHAR(64) NOT NULL,
    required_user_agent VARCHAR(255) NULL,
    required_referrer VARCHAR(255) NULL,
    playback_mode ENUM('direct', 'relay') NOT NULL DEFAULT 'direct',
    status ENUM('active', 'unavailable', 'disabled') NOT NULL DEFAULT 'active',
    last_checked_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_channels_stream_url_hash (stream_url_hash),
    KEY idx_channels_category (category),
    KEY idx_channels_country (country),
    KEY idx_channels_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Curated shelf membership (Nigeria, Africa, Sports, Movies, News, ...) from
-- IPTV-org's own region/category playlists — matched against already
-- ingested channels by stream_url_hash rather than re-ingested separately,
-- since these curated files are subsets of the main playlist.
CREATE TABLE channel_shelves (
    shelf_key VARCHAR(40) NOT NULL,
    channel_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (shelf_key, channel_id),
    KEY idx_channel_shelves_channel (channel_id),
    CONSTRAINT fk_channel_shelves_channel FOREIGN KEY (channel_id) REFERENCES channels (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE epg (
    id CHAR(36) NOT NULL PRIMARY KEY,
    channel_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- A channel can't have two programmes starting at the same instant, so
    -- this doubles as both the query index and the upsert dedup key —
    -- without it, re-ingestion would duplicate every row on every run.
    UNIQUE KEY uq_epg_channel_start (channel_id, start_time),
    CONSTRAINT fk_epg_channel FOREIGN KEY (channel_id) REFERENCES channels (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- On-demand
-- ---------------------------------------------------------------------

CREATE TABLE vod_sources (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    provider VARCHAR(80) NOT NULL,
    config JSON NULL,
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vod_items (
    id CHAR(36) NOT NULL PRIMARY KEY,
    vod_source_id CHAR(36) NOT NULL,
    type ENUM('movie', 'series') NOT NULL,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT NULL,
    poster_url VARCHAR(500) NULL,
    backdrop_url VARCHAR(500) NULL,
    year SMALLINT NULL,
    genre VARCHAR(120) NULL,
    runtime_minutes SMALLINT NULL,
    source_identifier VARCHAR(255) NOT NULL,
    playback_url VARCHAR(1000) NULL,
    tmdb_id VARCHAR(32) NULL,
    status ENUM('active', 'unavailable', 'disabled') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_vod_items_source_identifier (vod_source_id, source_identifier),
    KEY idx_vod_items_type (type),
    KEY idx_vod_items_genre (genre),
    KEY idx_vod_items_status (status),
    CONSTRAINT fk_vod_items_source FOREIGN KEY (vod_source_id) REFERENCES vod_sources (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vod_seasons (
    id CHAR(36) NOT NULL PRIMARY KEY,
    vod_item_id CHAR(36) NOT NULL,
    season_number SMALLINT NOT NULL,
    title VARCHAR(190) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_vod_seasons (vod_item_id, season_number),
    CONSTRAINT fk_vod_seasons_item FOREIGN KEY (vod_item_id) REFERENCES vod_items (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vod_episodes (
    id CHAR(36) NOT NULL PRIMARY KEY,
    vod_season_id CHAR(36) NOT NULL,
    episode_number SMALLINT NOT NULL,
    title VARCHAR(190) NULL,
    synopsis TEXT NULL,
    duration_minutes SMALLINT NULL,
    playback_url VARCHAR(1000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_vod_episodes (vod_season_id, episode_number),
    CONSTRAINT fk_vod_episodes_season FOREIGN KEY (vod_season_id) REFERENCES vod_seasons (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Personalization
-- ---------------------------------------------------------------------

CREATE TABLE favorites (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    item_type ENUM('channel', 'movie', 'series') NOT NULL,
    item_id CHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_favorites (user_id, item_type, item_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE watch_history (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    item_type ENUM('channel', 'movie', 'episode') NOT NULL,
    item_id CHAR(36) NOT NULL,
    watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_watch_history_user_watched (user_id, watched_at),
    CONSTRAINT fk_watch_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE vod_progress (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    vod_item_id CHAR(36) NOT NULL,
    vod_episode_id CHAR(36) NULL,
    position_seconds INT NOT NULL DEFAULT 0,
    duration_seconds INT NULL,
    completed TINYINT(1) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    -- No DB-level unique key here: MySQL's unique index treats every NULL as
    -- distinct, so a key including vod_episode_id (NULL for movies) can't
    -- enforce "one row per movie" — and the generated-column workaround for
    -- that runs into InnoDB's separate restriction against ON DELETE CASCADE
    -- on a column a generated column depends on, which breaks the
    -- vod_items -> vod_seasons -> vod_episodes cascade chain. Enforced
    -- instead in api/vod/progress.php via a select-then-upsert.
    KEY idx_vod_progress_lookup (user_id, vod_item_id, vod_episode_id),
    CONSTRAINT fk_vod_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_vod_progress_item FOREIGN KEY (vod_item_id) REFERENCES vod_items (id) ON DELETE CASCADE,
    CONSTRAINT fk_vod_progress_episode FOREIGN KEY (vod_episode_id) REFERENCES vod_episodes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_preferences (
    user_id CHAR(36) NOT NULL PRIMARY KEY,
    preferred_languages JSON NULL,
    preferred_countries JSON NULL,
    preferred_categories JSON NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Operations
-- ---------------------------------------------------------------------

-- Generic cursor/state tracker for chunked cron jobs (playlist ingestion,
-- later EPG ingestion) — lets each job resume a batch where it left off
-- instead of needing a long-running process.
CREATE TABLE ingestion_state (
    job_name VARCHAR(80) NOT NULL PRIMARY KEY,
    status ENUM('idle', 'fetching', 'processing', 'error') NOT NULL DEFAULT 'idle',
    cursor_position INT NOT NULL DEFAULT 0,
    total_items INT NULL,
    cache_path VARCHAR(500) NULL,
    last_full_run_at TIMESTAMP NULL,
    last_run_at TIMESTAMP NULL,
    last_error TEXT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE audit_logs (
    id CHAR(36) NOT NULL PRIMARY KEY,
    admin_id CHAR(36) NULL,
    action VARCHAR(120) NOT NULL,
    target_type VARCHAR(80) NULL,
    target_id VARCHAR(120) NULL,
    result ENUM('success', 'failure') NOT NULL DEFAULT 'success',
    metadata JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_audit_logs_created_at (created_at),
    CONSTRAINT fk_audit_logs_admin FOREIGN KEY (admin_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sliding-window rate limiting for sensitive endpoints (login, invite
-- acceptance) — a deliberately simple, good-enough-for-shared-hosting
-- deterrent against brute force, not a distributed-systems-grade limiter.
CREATE TABLE rate_limits (
    bucket_key VARCHAR(190) NOT NULL PRIMARY KEY,
    window_start TIMESTAMP NOT NULL,
    attempts INT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

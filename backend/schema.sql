-- ============================================================
-- News Pulse Database Schema (PostgreSQL)
-- ============================================================

-- Drop existing tables if re-initializing schema
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS clusters CASCADE;
DROP TABLE IF EXISTS ingestion_jobs CASCADE;

-- 1. CLUSTERS (Must exist before articles due to FOREIGN KEY)
CREATE TABLE clusters (
    id              SERIAL PRIMARY KEY,
    label           TEXT NOT NULL,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    article_count   INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clusters_time_range ON clusters (start_time, end_time);

-- 2. ARTICLES
CREATE TABLE articles (
    id              SERIAL PRIMARY KEY,
    url             TEXT NOT NULL UNIQUE,
    title           TEXT NOT NULL,
    source          TEXT NOT NULL,
    description     TEXT,
    body_text       TEXT,
    published_at    TIMESTAMPTZ NOT NULL,
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    extraction_ok   BOOLEAN NOT NULL DEFAULT TRUE,
    cluster_id      INTEGER REFERENCES clusters(id) ON DELETE SET NULL,
    
    CONSTRAINT articles_url_unique UNIQUE (url)
);

CREATE INDEX idx_articles_published ON articles (published_at DESC);
CREATE INDEX idx_articles_source    ON articles (source);
CREATE INDEX idx_articles_cluster   ON articles (cluster_id);

-- 3. INGESTION JOBS
CREATE TABLE ingestion_jobs (
    id                 TEXT PRIMARY KEY,
    status             TEXT NOT NULL DEFAULT 'pending', -- pending | running | completed | failed
    step               TEXT,
    step_number        INTEGER DEFAULT 0,
    total_steps        INTEGER DEFAULT 4,
    progress           INTEGER DEFAULT 0,
    articles_found     INTEGER DEFAULT 0,
    articles_new       INTEGER DEFAULT 0,
    articles_failed    INTEGER DEFAULT 0,
    duplicates_skipped INTEGER DEFAULT 0,
    clusters_created   INTEGER DEFAULT 0,
    error_message      TEXT,
    started_at         TIMESTAMPTZ,
    completed_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

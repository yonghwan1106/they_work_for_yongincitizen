-- Add cafe_posts table for Naver Cafe posts (용인블루)
-- This table stores scraped posts from https://cafe.naver.com/yonginblue

CREATE TABLE IF NOT EXISTS cafe_posts (
    id VARCHAR(50) PRIMARY KEY, -- Naver cafe article ID
    title VARCHAR(500) NOT NULL,
    author VARCHAR(100),
    post_date VARCHAR(50), -- Date string as displayed on cafe (e.g., "2025.10.16")
    views VARCHAR(20), -- View count as string
    url TEXT NOT NULL,
    is_notice BOOLEAN DEFAULT false,
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cafe_posts_post_date ON cafe_posts(post_date DESC);
CREATE INDEX IF NOT EXISTS idx_cafe_posts_scraped_at ON cafe_posts(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_cafe_posts_is_notice ON cafe_posts(is_notice);

-- RLS policies
ALTER TABLE cafe_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access to cafe_posts"
    ON cafe_posts
    FOR SELECT
    USING (true);

-- Only service role can insert/update/delete
CREATE POLICY "Allow service role to insert cafe_posts"
    ON cafe_posts
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update cafe_posts"
    ON cafe_posts
    FOR UPDATE
    USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete cafe_posts"
    ON cafe_posts
    FOR DELETE
    USING (auth.role() = 'service_role');

-- Add comment
COMMENT ON TABLE cafe_posts IS 'Stores posts from Naver Cafe "용인블루" (https://cafe.naver.com/yonginblue)';

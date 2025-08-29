-- Create pages table for Facebook corporate page management
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    facebook_page_id VARCHAR(255) UNIQUE NOT NULL,
    page_name VARCHAR(255) NOT NULL,
    page_access_token TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX idx_pages_facebook_page_id ON pages(facebook_page_id);
CREATE INDEX idx_pages_is_active ON pages(is_active);

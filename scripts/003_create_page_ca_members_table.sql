-- Create page_ca_members table for managing CA assignments to pages
CREATE TABLE IF NOT EXISTS page_ca_members (
    id SERIAL PRIMARY KEY,
    page_id INTEGER NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    ca_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page_id, ca_user_id)
);

-- Create indexes for performance
CREATE INDEX idx_page_ca_members_page_id ON page_ca_members(page_id);
CREATE INDEX idx_page_ca_members_ca_user_id ON page_ca_members(ca_user_id);

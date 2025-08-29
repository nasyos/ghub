-- Add new fields to candidates table for Facebook corporate page integration
ALTER TABLE candidates 
ADD COLUMN assigned_ca_id INTEGER NOT NULL REFERENCES users(id),
ADD COLUMN status VARCHAR(20) DEFAULT 'pre_registered' CHECK (status IN ('pre_registered', 'active')),
ADD COLUMN facebook_user_id VARCHAR(255) UNIQUE,
ADD COLUMN page_id INTEGER REFERENCES pages(id),
ADD COLUMN external_id VARCHAR(255),
ADD COLUMN notes TEXT;

-- Create index for performance
CREATE INDEX idx_candidates_assigned_ca ON candidates(assigned_ca_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_facebook_user_id ON candidates(facebook_user_id);

-- Update existing sample data to include new required fields
-- Update existing candidates to have assigned_ca_id (assuming CA users exist)
UPDATE candidates 
SET assigned_ca_id = (
    SELECT id FROM users WHERE role IN ('ca_staff', 'ca_manager') LIMIT 1
)
WHERE assigned_ca_id IS NULL;

-- Insert sample pages
INSERT INTO pages (facebook_page_id, page_name, is_active) VALUES
('123456789012345', 'GlobalHire Hub Japan', true),
('234567890123456', 'GlobalHire Hub Korea', true),
('345678901234567', 'GlobalHire Hub Philippines', false)
ON CONFLICT (facebook_page_id) DO NOTHING;

-- Insert sample page-CA relationships
INSERT INTO page_ca_members (page_id, ca_user_id)
SELECT p.id, u.id
FROM pages p, users u
WHERE p.facebook_page_id = '123456789012345' 
AND u.role IN ('ca_staff', 'ca_manager')
ON CONFLICT (page_id, ca_user_id) DO NOTHING;

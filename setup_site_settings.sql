-- Create a table for site-wide settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn off RLS for simplicity as requested by user context (Admin only app essentially)
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Insert default hero image if not exists
INSERT INTO site_settings (key, value)
VALUES ('hero_image_url', ''), ('hero_images', '[]')
ON CONFLICT (key) DO NOTHING;

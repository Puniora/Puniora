-- Force disable RLS on site_settings
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Just in case RLS cannot be disabled for some reason, add a policy to allow everyone to read
CREATE POLICY "Allow Public Read"
ON site_settings
FOR SELECT
USING (true);

-- Grant select to everyone (anon and authenticated)
GRANT SELECT ON site_settings TO anon, authenticated;

-- Verify keys exist (just to be safe, inert mostly if exists)
INSERT INTO site_settings (key, value)
VALUES ('hero_images', '[]')
ON CONFLICT (key) DO NOTHING;

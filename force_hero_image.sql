-- 1. Ensure we can write to the table
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- 2. Update the hero images directly. 
-- REPLACE THE LINK BELOW with your actual Google Drive/ImgBB link.
INSERT INTO site_settings (key, value, updated_at)
VALUES (
  'hero_images', 
  '["https://drive.google.com/uc?export=view&id= YOUR_FILE_ID_HERE "]', 
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- 3. Also update the legacy key just in case
INSERT INTO site_settings (key, value)
VALUES ('hero_image_url', 'https://drive.google.com/uc?export=view&id= YOUR_FILE_ID_HERE ')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

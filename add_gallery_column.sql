-- Add gallery column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT '{}';

-- Optional: Backfill gallery with main images if empty (so Visual Story isn't empty initially)
-- Uncomment the line below if you want to auto-populate existing products
-- UPDATE products SET gallery = images WHERE gallery IS NULL OR gallery = '{}';

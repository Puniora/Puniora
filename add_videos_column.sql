-- Add videos column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS videos text[] DEFAULT '{}';

-- Check if column was added successfully
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'videos';

-- Add bundle_items column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS bundle_items text[] DEFAULT '{}';

-- Refresh the schema cache if necessary
NOTIFY pgrst, 'reload schema';

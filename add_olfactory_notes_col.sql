-- Add olfactoryNotes column to products table
-- Storing as JSONB array of objects { name, image, description }

ALTER TABLE products 
ADD COLUMN "olfactoryNotes" JSONB DEFAULT '[]'::jsonb;

-- Note: We use quoted "olfactoryNotes" to preserve camelCase if that's what the application sends.
-- If the application sends lowercase 'olfactorynotes', this might effectively be the same in some contexts
-- but explicit quoting ensures it matches the JS property name exactly if Supabase is sensitive to it.

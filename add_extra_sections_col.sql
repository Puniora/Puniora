-- Add extra_sections column to products table to store expandable sections
-- We use JSONB to store the array of { title, content } objects

ALTER TABLE products 
ADD COLUMN "extraSections" JSONB DEFAULT '[]'::jsonb;

-- Grant access to authenticated and anon users (if RLS is enabled, policies might need update, but usually column add is enough for existing policies)
-- If you have strict column triggers, you might need to update them, but for basic usage this is enough.

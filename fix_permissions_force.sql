-- FORCE reset permissions for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop all known policies to start fresh
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Admin All Products" ON products;
DROP POLICY IF EXISTS "Allow all for authenticated" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Admin Update Products" ON products;
DROP POLICY IF EXISTS "Admin Insert Products" ON products;
DROP POLICY IF EXISTS "Admin Delete Products" ON products;

-- 1. READ: Everyone can see products
CREATE POLICY "Public Read Products" 
ON products 
FOR SELECT 
USING (true);

-- 2. WRITE: ALLOW ALL (Temporary fix for "Anonymous" admin issues)
-- We removed "TO authenticated" so this applies to public/anon users too.
CREATE POLICY "Admin Insert Products" 
ON products 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin Update Products" 
ON products 
FOR UPDATE 
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin Delete Products" 
ON products 
FOR DELETE 
USING (true);

-- Fix Review Permissions too
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Reviews" ON reviews;
DROP POLICY IF EXISTS "Public Insert Reviews" ON reviews;
DROP POLICY IF EXISTS "Admin Delete Reviews" ON reviews;
DROP POLICY IF EXISTS "Admin Update Reviews" ON reviews;

CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public Insert Reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin Delete Reviews" ON reviews FOR DELETE USING (true);
CREATE POLICY "Admin Update Reviews" ON reviews FOR UPDATE USING (true);

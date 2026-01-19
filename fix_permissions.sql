-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 1. Review existing policies (optional, just good to know for cleanup, usually we drop if exists)
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Admin All Products" ON products;
DROP POLICY IF EXISTS "Allow all for authenticated" ON products;
DROP POLICY IF EXISTS "Enable read access for all users" ON products;

-- 2. Create Policy: Everyone can View Products
CREATE POLICY "Public Read Products" 
ON products 
FOR SELECT 
USING (true);

-- 3. Create Policy: Only Authenticated Users (Admins) can Create/Update/Delete
CREATE POLICY "Admin All Products" 
ON products 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Also fix Reviews table permissions while we're at it
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Reviews" ON reviews;
DROP POLICY IF EXISTS "Public Insert Reviews" ON reviews;
DROP POLICY IF EXISTS "Admin Full Reviews" ON reviews;

-- Everyone can read reviews
CREATE POLICY "Public Read Reviews" 
ON reviews 
FOR SELECT 
USING (true);

-- Everyone can insert reviews (Guest reviews)
CREATE POLICY "Public Insert Reviews" 
ON reviews 
FOR INSERT 
WITH CHECK (true);

-- Only Admin can delete/update reviews
CREATE POLICY "Admin Delete Reviews" 
ON reviews 
FOR DELETE 
TO authenticated 
USING (true);

CREATE POLICY "Admin Update Reviews" 
ON reviews 
FOR UPDATE 
TO authenticated 
USING (true);

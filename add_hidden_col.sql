-- Add isHidden column to products table
-- boolean, default false

ALTER TABLE products 
ADD COLUMN "isHidden" BOOLEAN DEFAULT FALSE;

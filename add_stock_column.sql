ALTER TABLE products 
ADD COLUMN is_sold_out BOOLEAN DEFAULT FALSE;

-- Optional: Update existing records to default if needed (defaults to false by schema anyway)
UPDATE products SET is_sold_out = FALSE WHERE is_sold_out IS NULL;

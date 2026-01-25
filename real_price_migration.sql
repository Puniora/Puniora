-- Add real_price column to products table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'real_price') THEN 
        ALTER TABLE public.products ADD COLUMN real_price DECIMAL(10, 2); 
    END IF; 
END $$;

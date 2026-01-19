-- Drop everything for a fresh start
DROP TABLE IF EXISTS products CASCADE;

-- Create table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Men', 'Women', 'Unisex')),
  price DECIMAL(10, 2) NOT NULL,
  size TEXT NOT NULL,
  notes TEXT[] NOT NULL,
  description TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  variants JSONB DEFAULT '[]'::jsonb,
  is_gift_set BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE Row Level Security for production (development simplified)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Also ensure anyone can upload images to the storage bucket
-- (This fixes the RLS error during image upload)
DO $$ 
BEGIN
    -- Allow public uploads
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Uploads'
    ) THEN
        CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
    END IF;

    -- Allow public viewing
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public Viewing'
    ) THEN
        CREATE POLICY "Public Viewing" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
    END IF;
END $$;

-- Create the reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DISABLE RLS for reviews
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_mobile TEXT NOT NULL,
    address_json JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'pending' NOT NULL,
    tracking_status TEXT DEFAULT 'Order Placed' NOT NULL, -- New: Order Placed, Packed, Shipped, Out for Delivery, Delivered
    tracking_id TEXT, -- New: Courier tracking number
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    items JSONB NOT NULL
);

-- RLS for orders (Disabled for development ease)
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

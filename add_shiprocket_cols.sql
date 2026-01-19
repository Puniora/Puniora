-- Add Shiprocket Order and Tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shiprocket_order_id text,
ADD COLUMN IF NOT EXISTS shiprocket_shipment_id text,
ADD COLUMN IF NOT EXISTS awb_code text;

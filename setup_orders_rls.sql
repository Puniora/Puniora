-- Enable RLS on orders table (if not already enabled)
alter table public.orders enable row level security;

-- Drop existing read policy to avoid conflicts
drop policy if exists "Enable read access for all users" on public.orders;

-- Create policy to allow anyone to read orders (required for public tracking page)
-- In a more strict logic, we might check for specific criteria, but for guest tracking, public read is common
create policy "Enable read access for all users"
on public.orders for select
using (true);

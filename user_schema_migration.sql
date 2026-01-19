-- Create Profiles table (linked to auth.users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  full_name text,
  phone text,
  created_at timestamptz default now(),
  primary key (id)
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create a trigger to auto-create profile on signup
-- function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

-- trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create Addresses table
create table public.addresses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  address_line1 text not null,
  address_line2 text, -- area/road
  city text not null,
  state text not null,
  pincode text not null,
  phone text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS on addresses
alter table public.addresses enable row level security;

create policy "Users can view their own addresses."
  on addresses for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own addresses."
  on addresses for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own addresses."
  on addresses for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own addresses."
  on addresses for delete
  using ( auth.uid() = user_id );

-- Update Orders table to link to User
alter table public.orders 
add column if not exists user_id uuid references auth.users(id);

-- RLS for Orders (so users can see their own orders)
alter table public.orders enable row level security;

-- Existing admin policy (assuming admins have a way to view all or bypassing RLS via service role in admin panel, 
-- but since we are enabling RLS now, we need to ensure normal users can ONLY see their own)

create policy "Users can view their own orders"
  on orders for select
  using ( auth.uid() = user_id );
  
-- Allow anyone to create an order (guest checkout + logged in)
-- For guests, user_id is null.
create policy "Anyone can create orders"
  on orders for insert
  with check ( true );

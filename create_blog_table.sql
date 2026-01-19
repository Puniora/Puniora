-- Create blogs table
create table public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  excerpt text,
  content text not null, -- Rich text or markdown
  cover_image text not null,
  media_type text default 'image', -- 'image' or 'video'
  author_name text default 'Admin',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.blogs enable row level security;

-- Policies
create policy "Public can view blogs"
  on public.blogs for select
  using ( true );

-- Assuming valid admins are authenticated somehow or using service role for admin panel
-- For now, we'll allow authenticated users (or just everyone if we trust the admin panel protection) to insert/update.
-- Ideally, you'd check for specific admin email or role.
create policy "Admins can insert blogs"
  on public.blogs for insert
  with check ( true ); 

create policy "Admins can update blogs"
  on public.blogs for update
  using ( true );

create policy "Admins can delete blogs"
  on public.blogs for delete
  using ( true );

-- Function to update 'updated_at'
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_blog_updated
  before update on public.blogs
  for each row execute procedure public.handle_updated_at();

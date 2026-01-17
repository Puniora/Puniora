-- Create the bucket
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow uploads (INSERT)
create policy "Allow Public Uploads 2"
on storage.objects for insert
with check ( bucket_id = 'product-images' );

-- Allow viewing (SELECT)
create policy "Allow Public Select 2"
on storage.objects for select
using ( bucket_id = 'product-images' );

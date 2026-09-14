-- Admin-managed website media.
-- Product imagery remains in the products bucket; branding/page visuals use site-assets.

insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do update set public = excluded.public;

create table if not exists public.site_assets (
  key text primary key,
  label text not null,
  image_url text,
  storage_path text,
  updated_at timestamptz not null default now()
);

alter table public.site_assets enable row level security;

drop policy if exists "site assets public read" on public.site_assets;
create policy "site assets public read"
  on public.site_assets for select
  to anon, authenticated
  using (true);

drop policy if exists "site assets admin insert" on public.site_assets;
create policy "site assets admin insert"
  on public.site_assets for insert
  to authenticated
  with check (private.is_admin());

drop policy if exists "site assets admin update" on public.site_assets;
create policy "site assets admin update"
  on public.site_assets for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

drop policy if exists "site assets admin delete" on public.site_assets;
create policy "site assets admin delete"
  on public.site_assets for delete
  to authenticated
  using (private.is_admin());

drop policy if exists "site assets admin upload" on storage.objects;
create policy "site assets admin upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-assets' and private.is_admin());

drop policy if exists "site assets admin update storage" on storage.objects;
create policy "site assets admin update storage"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-assets' and private.is_admin())
  with check (bucket_id = 'site-assets' and private.is_admin());

drop policy if exists "site assets admin delete storage" on storage.objects;
create policy "site assets admin delete storage"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-assets' and private.is_admin());

insert into public.site_assets (key, label)
values
  ('logo', 'Site Logo'),
  ('home_hero', 'Home Hero Image'),
  ('about_image', 'About Page Image')
on conflict (key) do update set label = excluded.label;

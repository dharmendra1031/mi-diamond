-- Michael Jewellery Kuwait catalogue migration
-- Run after the base schema / 001 migration.
-- Converts the project from the old demo storefront to a catalogue-only Kuwait setup.

-- =====================================================
-- ADMIN SECURITY HELPER (not exposed through public RPC)
-- =====================================================
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to authenticated;

-- Keep trigger execution deterministic and silence mutable search_path warnings.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

-- =====================================================
-- KUWAIT CATALOGUE DEFAULTS
-- =====================================================
alter table public.products
  alter column currency set default 'KWD';

-- Remove the original Mi Diamond demo/test products only.
delete from public.products
where name in (
  'Celeste Solitaire Diamond Ring',
  'Luna Halo Engagement Ring',
  'Aurora Diamond Band',
  'Seraphina Rose Gold Ring',
  'Noir Private Diamond Ring',
  'Elysian Three-Stone Ring',
  'Marquise Wedding Band',
  'Opal Private Cocktail Ring',
  'Petite Solitaire Ring',
  'Emerald Engagement Ring',
  'Private Collection Test Ring'
);

-- Remove old demo categories, then add Michael Jewellery categories.
delete from public.categories
where slug in (
  'tektas', 'alyans', 'pirlanta', 'nisan', 'koleksiyon',
  'solitaire', 'wedding-bands', 'diamond-rings', 'engagement', 'special-collection'
);

insert into public.categories (slug, name, sort_order) values
  ('gold-sets', 'Gold Sets', 10),
  ('necklaces', 'Necklaces', 20),
  ('rings', 'Rings', 30),
  ('bracelets', 'Bracelets', 40),
  ('earrings', 'Earrings', 50),
  ('diamonds', 'Diamonds', 60)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order;

-- Ensure the product image bucket exists and remains public for catalogue reads.
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

-- =====================================================
-- PROFILES / ADMIN ACCESS
-- =====================================================
drop policy if exists "profiles: user read own" on public.profiles;
drop policy if exists "profiles: user update own" on public.profiles;
create policy "profiles: user read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.is_admin());

-- =====================================================
-- PRODUCTS
-- Public catalogue reads; admin-only management.
-- =====================================================
drop policy if exists "products: public read published" on public.products;
drop policy if exists "products: admin all" on public.products;
drop policy if exists "products: admin read" on public.products;
drop policy if exists "products: admin write" on public.products;
drop policy if exists "products: admin update" on public.products;
drop policy if exists "products: admin delete" on public.products;
drop policy if exists "products: anon read published" on public.products;
drop policy if exists "products: authenticated read" on public.products;

create policy "products: anon read published"
  on public.products for select to anon
  using (is_published = true);

create policy "products: authenticated read"
  on public.products for select to authenticated
  using (is_published = true or private.is_admin());

create policy "products: admin write"
  on public.products for insert to authenticated
  with check (private.is_admin());

create policy "products: admin update"
  on public.products for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "products: admin delete"
  on public.products for delete to authenticated
  using (private.is_admin());

-- =====================================================
-- CATEGORIES
-- Public reads; admin-only management.
-- =====================================================
drop policy if exists "categories: admin write" on public.categories;
drop policy if exists "categories: admin update" on public.categories;
drop policy if exists "categories: admin delete" on public.categories;

create policy "categories: admin write"
  on public.categories for insert to authenticated
  with check (private.is_admin());

create policy "categories: admin update"
  on public.categories for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy "categories: admin delete"
  on public.categories for delete to authenticated
  using (private.is_admin());

-- =====================================================
-- LEGACY CUSTOMER / SELLING TABLES
-- Kept for backwards-compatible schema only; no public writes.
-- =====================================================
drop policy if exists "orders: anon insert" on public.orders;
drop policy if exists "orders: own or admin read" on public.orders;
drop policy if exists "orders: admin read" on public.orders;
drop policy if exists "orders: admin update" on public.orders;
drop policy if exists "orders: admin delete" on public.orders;

create policy "orders: admin read"
  on public.orders for select to authenticated
  using (private.is_admin());
create policy "orders: admin update"
  on public.orders for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy "orders: admin delete"
  on public.orders for delete to authenticated
  using (private.is_admin());

drop policy if exists "newsletter: anon insert" on public.newsletter_subscribers;
drop policy if exists "newsletter: admin read" on public.newsletter_subscribers;
drop policy if exists "newsletter: admin delete" on public.newsletter_subscribers;

create policy "newsletter: admin read"
  on public.newsletter_subscribers for select to authenticated
  using (private.is_admin());
create policy "newsletter: admin delete"
  on public.newsletter_subscribers for delete to authenticated
  using (private.is_admin());

-- =====================================================
-- PRODUCT IMAGE STORAGE
-- =====================================================
drop policy if exists "products bucket: admin upload" on storage.objects;
drop policy if exists "products bucket: admin update" on storage.objects;
drop policy if exists "products bucket: admin delete" on storage.objects;

create policy "products bucket: admin upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and private.is_admin());

create policy "products bucket: admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'products' and private.is_admin())
  with check (bucket_id = 'products' and private.is_admin());

create policy "products bucket: admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'products' and private.is_admin());

-- 001 used a public helper; it is no longer needed after policies are migrated.
drop function if exists public.is_admin();

-- Michael Jewellery Kuwait - Supabase Schema
-- Catalogue-only storefront with admin-managed products and categories.
-- No public checkout, customer order creation, or newsletter submission flow.

-- =====================================================
-- SHARED UPDATED_AT TRIGGER
-- =====================================================
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
-- ADMIN PROFILES
-- =====================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  phone       text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name)
select id, raw_user_meta_data ->> 'full_name'
from auth.users
on conflict (id) do nothing;

-- Keep the admin helper outside the exposed public API schema.
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

-- =====================================================
-- CATEGORIES
-- =====================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.categories enable row level security;

-- =====================================================
-- PRODUCTS
-- =====================================================
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  description   text,
  category_id   uuid references public.categories(id) on delete set null,

  price         numeric(12, 3) not null check (price >= 0),
  old_price     numeric(12, 3) check (old_price is null or old_price > price),
  currency      text not null default 'KWD',

  images        text[] not null default '{}',

  metal         text,
  stone         text,
  carat         text,
  ring_size     text,

  is_published  boolean not null default true,
  is_featured   boolean not null default false,
  stock_status  text not null default 'available'
                check (stock_status in ('available', 'sold_out', 'on_request')),

  sku           text,
  stock         int,
  weight_grams  numeric(10, 3),

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.products enable row level security;

create index if not exists products_category_idx  on public.products(category_id);
create index if not exists products_published_idx on public.products(is_published);
create index if not exists products_featured_idx  on public.products(is_featured) where is_featured;
create index if not exists products_created_idx   on public.products(created_at desc);
create index if not exists products_search_idx on public.products using gin (
  to_tsvector(
    'simple',
    coalesce(name, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(metal, '') || ' ' ||
    coalesce(stone, '')
  )
);

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

-- =====================================================
-- LEGACY TABLES
-- Retained only for backwards compatibility with older code/migrations.
-- Public/customer writes are intentionally disabled by RLS.
-- =====================================================
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique default to_char(now(), 'YYMMDD') || '-' || substr(md5(random()::text), 1, 6),
  user_id         uuid references auth.users(id) on delete set null,
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  address_line    text,
  city            text,
  district        text,
  postal_code     text,
  items           jsonb not null default '[]'::jsonb,
  subtotal        numeric(12, 3) not null default 0,
  total           numeric(12, 3) not null default 0,
  currency        text not null default 'KWD',
  customer_note   text,
  admin_note      text,
  status          text not null default 'new'
                  check (status in ('new', 'contacted', 'confirmed', 'shipped', 'completed', 'cancelled')),
  payment_status  text not null default 'not_required'
                  check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'not_required')),
  payment_method  text,
  payment_id      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.orders enable row level security;
create index if not exists orders_status_idx  on public.orders(status);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_user_idx    on public.orders(user_id);

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

create table if not exists public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  is_active   boolean not null default true,
  source      text,
  created_at  timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

-- =====================================================
-- RLS POLICIES
-- =====================================================
drop policy if exists "profiles: user read own" on public.profiles;
drop policy if exists "profiles: user update own" on public.profiles;
create policy "profiles: user read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or private.is_admin());

-- Categories are visible to everyone, but only admins can change them.
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read"
  on public.categories for select to public
  using (true);

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

-- Anonymous visitors see published products only.
-- Signed-in admins can also see drafts/unpublished products.
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

-- Legacy order/newsletter tables remain admin-only.
drop policy if exists "orders: anon insert" on public.orders;
drop policy if exists "orders: own or admin read" on public.orders;
drop policy if exists "orders: admin read" on public.orders;
drop policy if exists "orders: admin update" on public.orders;
drop policy if exists "orders: admin delete" on public.orders;
create policy "orders: admin read"
  on public.orders for select to authenticated using (private.is_admin());
create policy "orders: admin update"
  on public.orders for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
create policy "orders: admin delete"
  on public.orders for delete to authenticated using (private.is_admin());

drop policy if exists "newsletter: anon insert" on public.newsletter_subscribers;
drop policy if exists "newsletter: admin read" on public.newsletter_subscribers;
drop policy if exists "newsletter: admin delete" on public.newsletter_subscribers;
create policy "newsletter: admin read"
  on public.newsletter_subscribers for select to authenticated using (private.is_admin());
create policy "newsletter: admin delete"
  on public.newsletter_subscribers for delete to authenticated using (private.is_admin());

-- =====================================================
-- PRODUCT IMAGE STORAGE
-- =====================================================
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

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

-- =====================================================
-- MICHAEL JEWELLERY CATEGORIES
-- =====================================================
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

-- After creating the intended admin user in Supabase Auth, mark that profile once:
-- update public.profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');

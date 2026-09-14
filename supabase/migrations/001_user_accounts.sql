-- Mi Diamond - Migration 001: Customer Accounts
-- Run this migration in the Supabase SQL Editor.
-- Idempotent: safe to run more than once.

-- =====================================================
-- 1) PROFILES TABLE
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

-- Automatically create a profile during signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create missing profiles for existing users, including admins
insert into public.profiles (id, full_name)
select id, raw_user_meta_data ->> 'full_name'
from auth.users
on conflict (id) do nothing;

-- =====================================================
-- 2) ADMIN CHECK FUNCTION
-- =====================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- =====================================================
-- 3) PROFILES RLS
-- =====================================================
drop policy if exists "profiles: user read own" on public.profiles;
create policy "profiles: user read own"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles: user update own" on public.profiles;
create policy "profiles: user update own"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid() and is_admin = (select is_admin from public.profiles where id = auth.uid()));

-- =====================================================
-- 4) ORDERS - user_id LINK
-- =====================================================
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_user_idx on public.orders(user_id);

-- Replace older admin RLS policies
drop policy if exists "orders: admin read" on public.orders;
drop policy if exists "orders: admin update" on public.orders;
drop policy if exists "orders: admin delete" on public.orders;

create policy "orders: own or admin read"
  on public.orders for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "orders: admin update"
  on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "orders: admin delete"
  on public.orders for delete to authenticated
  using (public.is_admin());

-- =====================================================
-- 5) PRODUCTS - admin-only writes
-- =====================================================
drop policy if exists "products: admin all" on public.products;

create policy "products: admin write"
  on public.products for insert to authenticated
  with check (public.is_admin());

create policy "products: admin update"
  on public.products for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "products: admin delete"
  on public.products for delete to authenticated
  using (public.is_admin());

-- =====================================================
-- 6) CATEGORIES - admin-only writes
-- =====================================================
drop policy if exists "categories: admin write" on public.categories;

create policy "categories: admin write"
  on public.categories for insert to authenticated
  with check (public.is_admin());

create policy "categories: admin update"
  on public.categories for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "categories: admin delete"
  on public.categories for delete to authenticated
  using (public.is_admin());

-- =====================================================
-- 7) NEWSLETTER - admin-only read/delete
-- =====================================================
drop policy if exists "newsletter: admin read" on public.newsletter_subscribers;
drop policy if exists "newsletter: admin delete" on public.newsletter_subscribers;

create policy "newsletter: admin read"
  on public.newsletter_subscribers for select to authenticated
  using (public.is_admin());

create policy "newsletter: admin delete"
  on public.newsletter_subscribers for delete to authenticated
  using (public.is_admin());

-- =====================================================
-- 8) STORAGE - admin-only uploads
-- =====================================================
drop policy if exists "products bucket: admin upload" on storage.objects;
drop policy if exists "products bucket: admin update" on storage.objects;
drop policy if exists "products bucket: admin delete" on storage.objects;

create policy "products bucket: admin upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());

create policy "products bucket: admin update"
  on storage.objects for update to authenticated
  using (bucket_id = 'products' and public.is_admin());

create policy "products bucket: admin delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- =====================================================
-- 9) MARK THE CURRENT ADMIN AS is_admin = true
-- =====================================================
-- REPLACE THE EMAIL BELOW WITH YOUR ADMIN EMAIL.
-- Then run:
-- update public.profiles
-- set is_admin = true
-- where id = (select id from auth.users where email = 'admin@midiamond.com.tr');

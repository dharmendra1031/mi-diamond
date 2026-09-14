-- Michael Jewellery Kuwait catalogue migration
-- Safe to run after 001_user_accounts.sql.

-- Use Kuwaiti Dinar for catalogue pricing.
alter table public.products
  alter column currency set default 'KWD';

update public.products
set currency = 'KWD'
where currency is null or currency = 'TRY';

-- Admins must be able to see unpublished catalogue items as well as public ones.
drop policy if exists "products: admin read" on public.products;
create policy "products: admin read"
  on public.products for select to authenticated
  using (public.is_admin());

-- Add common Michael Jewellery catalogue categories without removing existing data.
insert into public.categories (slug, name, sort_order) values
  ('gold-sets', 'Gold Sets', 10),
  ('necklaces', 'Necklaces', 20),
  ('rings', 'Rings', 30),
  ('bracelets', 'Bracelets', 40),
  ('earrings', 'Earrings', 50),
  ('diamonds', 'Diamonds', 60)
on conflict (slug) do nothing;

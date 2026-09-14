# Michael Jewellery Kuwait

Premium jewellery catalogue built with **Next.js 16, React 19, TypeScript, Tailwind CSS, and Supabase**.

This repository is configured for **Michael Jewellery, Hawalli, Kuwait**. It is a catalogue website rather than an online checkout store: visitors browse collections and product details, then contact the store directly.

## Public Website

- Michael Jewellery branding and supplied logo
- Premium home page with controlled-size brand imagery
- Collection and category browsing
- Product search and filters
- Product detail pages with image gallery, description, material details, availability, and KWD price
- WhatsApp and phone enquiry actions
- About, Contact, and catalogue-focused Privacy pages
- Customer account, cart, wishlist, checkout, order-request, FAQ selling flow, and shipping/returns routes are disabled

## Admin Panel

- Supabase Auth protected admin login
- Catalogue-only dashboard
- Product create/edit/delete
- Multiple product image upload
- Category management
- Published / draft products
- Featured products
- Stock status / made-to-order status
- KWD pricing
- Admin-only database and image-storage write policies

## Michael Jewellery Details

- **Brand:** Michael Jewellery
- **Location:** Hawalli, Ibn Khaldoon St., Al-Haddad Complex, Shop 3, Kuwait
- **Phone:** +965 2266 1269
- **Mobile / WhatsApp:** +965 9785 0983
- **Instagram:** @michael.jewellerykwt
- **Currency:** KWD

## Developer Setup

### Requirements

- Node.js 20+
- Supabase project

### Install

```bash
npm ci
```

### Environment

Copy `.env.example` to `.env.local` and fill the Supabase project values. Michael Jewellery public defaults are already present in `.env.example`.

### Supabase Setup

For a fresh database, use:

```text
supabase/schema.sql
```

For an older Mi Diamond database, use the migration under:

```text
supabase/migrations/002_michael_jewellery_kuwait.sql
```

The current schema provides KWD catalogue defaults, Michael Jewellery categories, admin profile support, RLS protection, and admin-only product image writes.

### Development

```bash
npm run dev
```

Open `http://localhost:3000`.

### Verification

```bash
npm run lint
npm run build
npm start
```

## Content Management

Admin login is available at:

```text
/admin/login
```

To add a product:

1. Open **Products** → **New Product**.
2. Enter product name, description, category, and KWD price.
3. Upload clear high-resolution product images.
4. Add material / stone / carat information where relevant.
5. Publish only when the product is ready to appear publicly.
6. Mark selected pieces as Featured when needed.

For best visual quality, use portrait product images around **1600 × 2000 px or larger** when the original photography is available. The first uploaded image is used as the cover.

## Image Quality

The supplied Michael Jewellery social-media screenshots are used only as controlled-size editorial visuals so they are not stretched beyond their source quality. The homepage hero uses the supplied high-resolution Michael Jewellery logo with a premium burgundy/gold composition. Real catalogue products should use the best available original photography uploaded through the admin panel.

## Project Structure

```text
app/
  (public)/      Public catalogue pages
  admin/         Protected catalogue admin
components/      Header, footer, product and admin UI
lib/supabase/    Supabase clients, auth and middleware
public/
  michael-jewellery/   Michael Jewellery brand assets
supabase/        Current schema and migration SQL
```

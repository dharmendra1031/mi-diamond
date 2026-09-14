# Mi Diamond

**Next.js + Supabase jewellery catalog and order-request platform**

Mi Diamond is a boutique jewellery catalog with product browsing, filters, cart,
wishlist, order requests, customer accounts, and a full admin panel. Online
payment fields are already present in the database for a future paid checkout.

## Features

### Customer Side
- Home, collection, category, and product detail pages
- Multi-image product gallery
- Price, discount, and stock badges
- Category, metal, stone, price range, and discount filters
- Search
- Cart stored in `localStorage`
- Wishlist stored in `localStorage`
- Order request flow without online payment
- WhatsApp quick contact
- Newsletter signup
- About, Contact, FAQ, Shipping & Returns, and Privacy pages

### Admin Panel
- Supabase Auth protected login
- Dashboard with product, category, and request summary
- Product CRUD with multi-image upload, cover image, sorting, stock status, and discount calculation
- Category CRUD
- Order request management with status updates, internal notes, call links, and WhatsApp links
- Newsletter subscriber list

### Payment-Ready Foundation
- The `orders` table includes `payment_status`, `payment_method`, and `payment_id`
- Current flow: cart -> request form -> database
- Future flow can become: cart -> payment -> database
- Suggested providers: iyzico for Turkey or Stripe for international cards

## Developer Setup

### Requirements
- Node.js 20+
- Supabase account
- Optional Vercel account for deployment

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and fill the values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PHONE=
NEXT_PUBLIC_WHATSAPP=
NEXT_PUBLIC_EMAIL=
NEXT_PUBLIC_ADDRESS=Istanbul, Turkey
NEXT_PUBLIC_INSTAGRAM=
```

### Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a new project at `supabase.com`.
2. Copy the API values into `.env.local`.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Create a public Storage bucket named `products`.
5. Enable Email auth.
6. Create the admin user manually, then mark the profile as admin.

## Deployment

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Add all `.env.local` values as Vercel environment variables.
4. Deploy.

## Content Management

### First Login
1. Visit `/admin/login`.
2. Sign in with the admin email and password.

### Add Products
1. Open **Products** -> **New Product**.
2. Name and price are required.
3. Add an old price to show an automatic discount badge.
4. Upload one or more photos; the first image is used as the cover.
5. Use the Published and Featured toggles as needed.

### Order Tracking
- Order requests appear under **Orders**.
- Each request includes call and WhatsApp actions.
- Statuses can be updated: New -> Contacted -> Confirmed -> Shipped -> Completed.

## Project Structure

```text
app/
  (public)/      Public pages with header and footer
  admin/         Protected admin panel
components/
  cart/          Cart and wishlist context plus UI
  admin/         Admin-only components
lib/supabase/    Supabase clients, auth, middleware, and types
supabase/        Database schema and migrations
```

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Future Paid Checkout

The current data model is ready for payment integration. A future version should:

1. Choose a payment provider.
2. Replace the order request submit action with a payment step.
3. Add payment initiation and callback route handlers.
4. Mark successful orders with `payment_status = paid`.
5. Add invoice, tax, and shipping fee fields if needed.

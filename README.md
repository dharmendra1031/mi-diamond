# Michael Jewellery Kuwait

Premium jewellery catalogue built with **Next.js 16, React 19, TypeScript, Tailwind CSS, Microsoft SQL Server, and VPS local image storage**.

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

- MSSQL-backed session login for administrators
- Catalogue-only dashboard
- Product create/edit/delete
- Multiple product image upload to the VPS filesystem
- Category management
- Published / draft products
- Featured products
- Stock status / made-to-order status
- KWD pricing
- Site logo, homepage hero and About image management

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
- Microsoft SQL Server Database Engine
- TCP/IP enabled for the SQL Server instance
- SQL Server login for the application

### Install

The MSSQL migration branch regenerates the dependency lockfile:

```bash
npm install
```

### Environment

Copy `.env.example` to `.env.local` and configure the MSSQL connection values.

### Database Setup

Create/select the target database in SSMS and run:

```text
database/mssql-schema.sql
```

This creates the application tables and seeds the current Michael Jewellery categories, products and site-asset paths.

Full VPS cutover instructions are in:

```text
database/README.md
```

### Existing Image Migration

Run on the VPS from the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\migrate-images.ps1
```

Existing catalogue/site images are copied into `public/uploads` and the database seed points to those local URLs.

### Admin Account

Supabase password hashes cannot be exported. Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`, then run:

```bash
npm run create-admin
```

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

New product images are saved under `public/uploads/products`. Site images are saved under `public/uploads/site-assets`. Only their relative paths are stored in MSSQL.

## Project Structure

```text
app/
  (public)/      Public catalogue pages
  admin/         Protected catalogue admin
  api/           Local auth, data mutation and image upload endpoints
components/      Header, footer, product and admin UI
database/        MSSQL schema, seed and deployment notes
lib/
  mssql.ts       SQL Server connection pool
  local-auth.ts  Local session/password authentication
  supabase/      Temporary compatibility adapter used by existing page imports; backed by MSSQL/local APIs, not Supabase
public/
  michael-jewellery/   Brand assets
  uploads/             Runtime product/site uploads (gitignored)
scripts/
  create-admin.mjs
  migrate-images.ps1
```

The `lib/supabase` directory name remains temporarily to minimize UI/page churn during this migration branch. It no longer imports or connects to Supabase.

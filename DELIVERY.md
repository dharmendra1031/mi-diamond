# Michael Jewellery Kuwait - Delivery Notes

This file summarizes the current client-facing scope and handover status.

## Included Public Pages

| Page | URL | Purpose |
| --- | --- | --- |
| Home | `/` | Premium Michael Jewellery branding, collections, editorial showcase |
| Collection | `/products` | Product catalogue with filters |
| Product Detail | `/products/[slug]` | Gallery, KWD price, details, availability, WhatsApp / phone enquiry |
| Search | `/search?q=...` | Catalogue search |
| About | `/about` | Michael Jewellery brand/store introduction |
| Contact | `/contact` | Hawalli address, phone, WhatsApp, Instagram |
| Privacy | `/privacy` | Catalogue-focused privacy information |
| Admin Login | `/admin/login` | Protected catalogue administration |
| Admin | `/admin` | Product/category management dashboard |

## Disabled Legacy Flows

The following older e-commerce/customer flows are intentionally disabled and redirect away from their old pages:

- Customer login / registration
- Customer account
- Cart
- Wishlist
- Checkout / order request
- Shipping & returns selling flow
- Selling/order FAQ flow
- Admin order-management route

This matches the Michael Jewellery requirement: the website is a **catalogue and branding website**, not an online selling platform.

## What The Client Can Manage

From the admin panel, the client can:

- Add, edit, and delete products
- Upload multiple product photos
- Choose the cover image
- Add product descriptions
- Enter KWD prices and optional old prices
- Set stock status: In Stock, Sold Out, Made to Order
- Publish/unpublish products
- Mark selected products as Featured
- Add and edit categories
- Add material, stone, carat, and ring-size details where relevant

## Current Michael Jewellery Details

- **Brand:** Michael Jewellery
- **Address:** Hawalli, Ibn Khaldoon St., Al-Haddad Complex, Shop 3, Kuwait
- **Phone:** +965 2266 1269
- **Mobile / WhatsApp:** +965 9785 0983
- **Instagram:** @michael.jewellerykwt
- **Currency:** KWD

## Current Database State

- Supabase catalogue schema is active
- Product price default is KWD
- Product image bucket is public for catalogue display
- Product/category writes are admin-only through RLS
- Draft/unpublished products are visible to admins
- Public visitors see only published products
- Legacy anonymous order/newsletter writes are disabled
- Michael Jewellery categories are seeded
- Old Mi Diamond demo/test products were removed

## Image Quality Guidance

The supplied social-media screenshots are relatively small, so the website uses them only in controlled-size editorial cards instead of stretching them into a full-screen hero.

The main hero uses the supplied Michael Jewellery logo with a high-quality burgundy/gold layout.

For real catalogue products, upload the best original photography available. Recommended target:

- Portrait orientation where possible
- Around **1600 × 2000 px or larger**
- Clean JPG/WebP/PNG
- Avoid WhatsApp-compressed screenshots when original photos are available

## Content Still Needed For Real Product Catalogue

The admin catalogue is ready, but real product entries require the actual business data for each piece:

- Product name
- Category
- Description
- KWD price
- Availability
- Original high-resolution photos
- Optional material / stone / carat details

No fake prices or invented product specifications should be added.

## Verification Commands

```bash
npm ci
npm run lint
npm run build
npm start
```

## Support / Handover

The first handover should include:

- Admin login demonstration
- How to add/edit categories
- How to upload high-resolution product images
- How to publish/unpublish a product
- How Featured products affect the catalogue/homepage

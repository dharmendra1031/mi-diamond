# Mi Diamond - Customer Delivery Notes

This file summarizes what the client receives and how the project should be handed over.

## Included Pages

| Page | URL | Content |
| --- | --- | --- |
| Home | `/` | Hero, collections, featured products |
| Collection | `/products` | Filtered product list |
| Product Detail | `/products/[slug]` | Gallery, price, details, add to cart |
| About | `/about` | Brand story |
| Contact | `/contact` | Phone, email, address, WhatsApp, Instagram |
| FAQ | `/faq` | Frequently asked questions |
| Shipping & Returns | `/shipping-returns` | Policies |
| Privacy | `/privacy` | Privacy policy |
| Cart | `/cart` | Customer cart |
| Wishlist | `/wishlist` | Wishlist |
| Order Request | `/order` | Request form without online payment |
| Search | `/search?q=...` | Product search |
| Admin | `/admin` | Protected admin panel |

## What The Client Can Manage

From the admin panel, the client can:

- Add, edit, and delete products
- Upload multiple product photos
- Choose the cover image
- Update prices and discounts
- Manage stock status: In Stock, Sold Out, Made to Order
- Add and edit categories
- View incoming order requests
- Contact customers by phone or WhatsApp
- Update order request status

## Order Flow Without Online Payment

1. Customer adds products to the cart.
2. Customer clicks **Create Order Request**.
3. Customer fills out the contact and delivery form.
4. The request appears in the admin panel.
5. The business contacts the customer by phone or WhatsApp.
6. Product and payment details are confirmed.
7. Payment is collected by bank transfer, payment link, or in-store cash/card.
8. The request is marked as **Completed**.

## Fixed Annual Costs

| Item | Estimated Cost | Notes |
| --- | ---: | --- |
| Domain | ~250 TL/year | Depends on registrar |
| Vercel | 0 TL | Hobby tier |
| Supabase | 0 TL | Free tier |
| Image Storage | 0 TL | Included in Supabase free tier |
| Total | ~250 TL/year | Traffic growth may require paid plans |

## Future Payment Integration

The project is ready for online payment integration. To activate it:

- Choose iyzico, PayTR, Stripe, or another provider
- Add a payment step after the cart/request form
- Add payment initiation and callback route handlers
- Mark successful records with `payment_status = paid`

Estimated work: 15-20 development hours.

## Content Needed Before Launch

- Logo files (`.svg` and `.png`)
- High-resolution product photos
- Product names, descriptions, and prices
- WhatsApp number
- Instagram username
- Full address
- Final About text
- Optional banner images

## Support Notes

The first support period should include:

- Small UI adjustments
- Admin panel training
- Content entry guidance

An ongoing monthly maintenance agreement can be added later.

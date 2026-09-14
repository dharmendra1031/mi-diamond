"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, subtotal, update, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-prose py-20 text-center">
        <div className="jewel-panel mx-auto max-w-xl rounded-[1.75rem] px-6 py-14">
          <ShoppingBag className="mx-auto h-12 w-12 text-gold-500" strokeWidth={1.2} />
          <h1 className="mt-6 font-serif text-3xl text-ink-900">Your cart is empty</h1>
          <p className="mt-2 font-bold text-ink-900">
            Explore the designs in our collection.
          </p>
          <Link href="/products" className="btn-primary mt-8">
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-prose py-12 md:py-16">
      <p className="label-eyebrow">Selected Pieces</p>
      <h1 className="mt-2 font-serif text-4xl text-ink-900 md:text-5xl">My Cart</h1>
      <p className="mt-2 text-sm font-bold text-ink-900">
        {items.length} products / {items.reduce((a, i) => a + i.quantity, 0)} items total
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-ink-700/10 rounded-[1.5rem] border border-white/70 bg-white/78 shadow-premium backdrop-blur">
          {items.map((item) => (
            <li key={item.product_id} className="flex gap-4 p-4 sm:p-6">
              <Link
                href={`/products/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/70 bg-silver-100 shadow-soft sm:h-28 sm:w-28"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-serif text-xl text-ink-200">
                    Mi
                  </div>
                )}
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-serif text-lg text-ink-900 transition hover:text-gold-700"
                >
                  {item.name}
                </Link>
                <div className="mt-1 text-sm font-semibold text-ink-700">
                  {formatPrice(item.price)}
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="inline-flex items-center rounded-full border border-ink-700/20 bg-white/70">
                    <button
                      onClick={() =>
                        update(item.product_id, item.quantity - 1)
                      }
                      className="flex h-9 w-9 items-center justify-center text-ink-500 hover:text-ink-700"
                      aria-label="Decrease"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        update(item.product_id, item.quantity + 1)
                      }
                      className="flex h-9 w-9 items-center justify-center text-ink-500 hover:text-ink-700"
                      aria-label="Increase"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-ink-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => remove(item.product_id)}
                      className="text-ink-400 hover:text-red-500"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="jewel-panel sticky top-28 h-fit rounded-[1.5rem] p-6">
          <h2 className="font-serif text-2xl text-ink-900">Order Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="font-medium text-ink-700">Subtotal</dt>
              <dd className="font-semibold text-ink-900">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-ink-700">Shipping</dt>
              <dd className="font-semibold text-ink-900">After Request</dd>
            </div>
            <div className="flex justify-between border-t border-ink-700/10 pt-3 text-base font-medium">
              <dt className="text-ink-900">Total</dt>
              <dd className="font-semibold text-ink-900">{formatPrice(subtotal)}</dd>
            </div>
          </dl>

          <Link
            href="/order"
            className="btn-primary mt-6 w-full"
          >
            Create Order Request <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-4 text-xs font-medium leading-relaxed text-ink-700">
            Online payment is not available right now. After you create your request,
            our team will contact you and share payment
            options.
          </p>

          <button
            onClick={() => {
              if (confirm("Are you sure you want to clear the cart?")) {
                clear();
              }
            }}
            className="mt-4 w-full text-xs font-semibold text-ink-600 hover:text-red-500"
          >
            Clear Cart
          </button>
        </aside>
      </div>
    </div>
  );
}

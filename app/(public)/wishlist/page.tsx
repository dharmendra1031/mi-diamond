"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/components/cart/wishlist-context";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { add } = useCart();

  if (items.length === 0) {
    return (
      <div className="container-prose py-20 text-center">
        <Heart className="mx-auto h-12 w-12 text-ink-200" strokeWidth={1.2} />
        <h1 className="mt-6 font-serif text-3xl text-ink-700">
          Your wishlist is empty
        </h1>
        <p className="mt-2 text-ink-500">
          Mark products you like with the heart icon.
        </p>
        <Link href="/products" className="btn-primary mt-8">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-prose py-12 md:py-16">
      <h1 className="font-serif text-4xl text-ink-700">Wishlistim</h1>
      <p className="mt-1 text-sm text-ink-500">{items.length} products</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div key={item.product_id} className="group relative">
            <Link href={`/products/${item.slug}`} className="block">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-ink-50">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center font-serif text-3xl text-ink-200">
                    Mi
                  </div>
                )}
              </div>
              <h3 className="mt-3 font-serif text-lg text-ink-700">
                {item.name}
              </h3>
              <p className="mt-1 text-sm text-ink-700">
                {formatPrice(item.price)}
              </p>
            </Link>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  add({
                    product_id: item.product_id,
                    slug: item.slug,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                  });
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink-700 px-4 py-2 text-xs font-medium text-cream hover:bg-ink-600"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Carte
              </button>
              <button
                onClick={() => remove(item.product_id)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-400 hover:text-red-500"
                aria-label="Remove"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

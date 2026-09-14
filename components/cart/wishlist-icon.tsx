"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "./wishlist-context";

export function WishlistIcon() {
  const { items } = useWishlist();

  return (
    <Link
      href="/wishlist"
      className="relative flex h-10 w-10 items-center justify-center text-ink-700 hover:text-gold-500 transition"
      aria-label="Wishlist"
    >
      <Heart className="h-5 w-5" />
      {items.length > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-medium text-ink-700">
          {items.length}
        </span>
      )}
    </Link>
  );
}

"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "./wishlist-context";
import type { Product } from "@/lib/supabase/types";

export function WishlistButton({
  product,
  variant = "icon",
}: {
  product: Product;
  variant?: "icon" | "button";
}) {
  const { toggle, has } = useWishlist();
  const active = has(product.id);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? null,
    });
  }

  if (variant === "button") {
    return (
      <button onClick={onClick} className="btn-outline">
        <Heart
          className={`h-4 w-4 ${active ? "fill-current text-red-500" : ""}`}
        />
        {active ? "Remove from Wishlist" : "Add to Wishlist"}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 backdrop-blur transition hover:bg-cream"
    >
      <Heart
        className={`h-4 w-4 ${active ? "fill-current text-red-500" : "text-ink-500"}`}
      />
    </button>
  );
}

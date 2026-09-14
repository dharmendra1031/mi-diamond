"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCart } from "./cart-context";
import type { Product } from "@/lib/supabase/types";

export function AddToCartButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  if (product.stock_status === "sold_out") {
    return (
      <button
        disabled
        className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-200 px-6 py-3 text-sm font-medium text-ink-500"
      >
        Sold Out
      </button>
    );
  }

  function onClick() {
    add({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? null,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <button onClick={onClick} className="btn-primary">
      {added ? (
        <>
          <Check className="h-4 w-4" /> Carte Addndi
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Carte Add
        </>
      )}
    </button>
  );
}

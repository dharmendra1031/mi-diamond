import type { Product } from "@/lib/supabase/types";

const PRODUCT_IMAGE_REPLACEMENTS: Record<string, string[]> = {
  "signature-18k-gold-jewellery-set": [
    "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?auto=format&fit=crop&w=1600&q=90",
  ],
};

export function getDisplayImages(product: Pick<Product, "slug" | "images">) {
  return PRODUCT_IMAGE_REPLACEMENTS[product.slug] ?? product.images ?? [];
}

export function getDisplayCover(product: Pick<Product, "slug" | "images">) {
  return getDisplayImages(product)[0];
}

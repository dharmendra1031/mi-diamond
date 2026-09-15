import type { Product } from "@/lib/supabase/types";

export function getDisplayImages(product: Pick<Product, "images">) {
  return product.images ?? [];
}

export function getDisplayCover(product: Pick<Product, "images">) {
  return getDisplayImages(product)[0];
}

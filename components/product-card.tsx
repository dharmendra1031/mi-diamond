import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/supabase/types";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product.price, product.old_price);
  const cover = product.images[0];
  const soldOut = product.stock_status === "sold_out";
  const detail = [product.stone, product.metal].filter(Boolean).join(" · ");

  return (
    <article className="group relative">
      <Link href={`/urunler/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#efede7]">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-white to-ink-50 text-ink-200">
              <span className="font-serif text-4xl tracking-[0.15em]">MI</span>
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-col gap-1.5">
              {discount && (
                <span className="w-fit bg-cream/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink-700">
                  %{discount} İndirim
                </span>
              )}
              {product.is_featured && !discount && (
                <span className="w-fit bg-ink-900/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-cream">
                  Seçkin Parça
                </span>
              )}
              {soldOut && (
                <span className="w-fit bg-ink-900/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-cream">
                  Tükendi
                </span>
              )}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-ink-900/92 px-4 py-3 text-cream transition duration-300 group-hover:translate-y-0">
            <span className="flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em]">
              Tasarımı İncele
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <div className="px-1 pt-4 text-center">
          {detail && (
            <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-ink-400">
              {detail}
            </p>
          )}
          <h3 className="font-serif text-xl leading-tight text-ink-700 transition group-hover:text-gold-600">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline justify-center gap-2">
            <span className="text-sm font-medium text-ink-700">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.old_price && (
              <span className="text-xs text-ink-300 line-through">
                {formatPrice(product.old_price, product.currency)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

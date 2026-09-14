import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/supabase/types";

export function ProductCard({ product }: { product: Product }) {
  const hasPrice = product.price > 0;
  const discount = hasPrice ? discountPercent(product.price, product.old_price) : null;
  const cover = product.images[0];
  const soldOut = product.stock_status === "sold_out";
  const detail = [product.stone, product.metal].filter(Boolean).join(" / ");

  return (
    <article className="group relative">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-t-[1.35rem] border border-white/70 bg-gradient-to-br from-cream via-silver-100 to-gold-100 shadow-premium">
          {cover ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              quality={95}
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.045]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#efe7d8] to-[#d7c7aa] text-ink-700/25">
              <span className="font-serif text-4xl tracking-[0.15em]">MJ</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-ink-700/18 via-transparent to-white/5 opacity-80" />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-col gap-1.5">
              {discount && (
                <span className="w-fit rounded-full bg-gold-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900 shadow-gold">
                  %{discount} Off
                </span>
              )}
              {product.is_featured && !discount && (
                <span className="w-fit rounded-full bg-ink-700/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-cream ring-1 ring-white/20">
                  Featured Piece
                </span>
              )}
              {soldOut && (
                <span className="w-fit rounded-full bg-ink-700/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-cream ring-1 ring-white/20">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          <div className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full border border-white/25 bg-ink-700/92 px-4 py-3 text-cream opacity-0 shadow-soft backdrop-blur transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em]">
              View Design
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        <div className="rounded-b-[1.35rem] border-x border-b border-white/70 bg-white/82 px-4 pb-5 pt-4 text-center shadow-soft backdrop-blur">
          {detail && (
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-600">
              {detail}
            </p>
          )}
          <h3 className="font-serif text-xl leading-tight text-ink-900 transition group-hover:text-gold-700">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline justify-center gap-2">
            {hasPrice ? (
              <>
                <span className="text-sm font-bold text-ink-900">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.old_price && (
                  <span className="text-xs text-ink-300 line-through">
                    {formatPrice(product.old_price, product.currency)}
                  </span>
                )}
              </>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-700">
                Contact for price
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

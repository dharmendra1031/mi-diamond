import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Diamond,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  discountPercent,
  formatPrice,
  siteConfig,
  stockLabel,
  whatsappUrl,
} from "@/lib/format";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { getDisplayImages } from "@/lib/product-images";
import type { Product, ProductWithCategory } from "@/lib/supabase/types";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*, categories(id, slug, name)")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle<ProductWithCategory>();

  if (!product) notFound();

  const hasPrice = product.price > 0;
  const discount = hasPrice ? discountPercent(product.price, product.old_price) : null;
  const priceText = hasPrice ? formatPrice(product.price, product.currency) : "price enquiry";
  const message = `Hello Michael Jewellery, I would like information about ${product.name} (${priceText}).`;

  const { data: relatedRaw } = product.category_id
    ? await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .limit(4)
    : { data: [] as Product[] };

  const related = relatedRaw ?? [];

  const specs: { label: string; value: string | null }[] = [
    { label: "Metal", value: product.metal },
    { label: "Stone", value: product.stone },
    { label: "Karat", value: product.carat },
    { label: "Ring Size", value: product.ring_size },
  ].filter((spec) => spec.value);

  return (
    <article className="container-prose py-10 md:py-16">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600 transition hover:text-ink-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Collection
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 xl:gap-20">
        <ProductGallery
          images={getDisplayImages(product)}
          name={product.name}
          discount={discount}
        />

        <div className="jewel-panel rounded-[1.75rem] p-5 sm:p-7 lg:sticky lg:top-32 lg:h-fit">
          {product.categories && (
            <Link
              href={`/products?category=${product.categories.slug}`}
              className="label-eyebrow transition hover:text-gold-400"
            >
              {product.categories.name}
            </Link>
          )}

          <h1 className="mt-4 max-w-xl font-serif text-4xl leading-[1.05] text-ink-900 md:text-5xl xl:text-6xl">
            {product.name}
          </h1>

          <div className="mt-7 flex items-baseline gap-4 border-b border-ink-700/10 pb-7">
            {hasPrice ? (
              <>
                <span className="font-serif text-3xl text-ink-900 md:text-4xl">
                  {formatPrice(product.price, product.currency)}
                </span>
                {product.old_price && (
                  <span className="text-base text-ink-300 line-through">
                    {formatPrice(product.old_price, product.currency)}
                  </span>
                )}
              </>
            ) : (
              <span className="font-serif text-3xl text-gold-700 md:text-4xl">
                Contact for price
              </span>
            )}
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-ink-700/10 bg-white/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-700">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                product.stock_status === "available"
                  ? "bg-emerald-500"
                  : product.stock_status === "sold_out"
                    ? "bg-red-500"
                    : "bg-gold-400"
              }`}
            />
            {stockLabel[product.stock_status]}
          </div>

          {product.description && (
            <p className="mt-7 whitespace-pre-line text-sm font-medium leading-7 text-ink-700">
              {product.description}
            </p>
          )}

          {specs.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-3 border-y border-ink-700/10 py-7">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-soft">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.14em] text-ink-600">
                    {spec.label}
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-ink-900">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={whatsappUrl(message)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
            </a>
            <a
              href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
              className="btn-outline"
            >
              <Phone className="h-4 w-4" /> Call Now
            </a>
          </div>

          <div className="mt-8 grid gap-4 border-t border-ink-700/10 pt-7 sm:grid-cols-2">
            <div className="flex gap-3">
              <Diamond className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" strokeWidth={1.2} />
              <div>
                <p className="text-xs font-bold text-ink-900">Refined design</p>
                <p className="mt-1 text-xs font-medium leading-5 text-ink-700">Detail-focused, timeless beauty.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" strokeWidth={1.2} />
              <div>
                <p className="text-xs font-bold text-ink-900">Personal support</p>
                <p className="mt-1 text-xs font-medium leading-5 text-ink-700">One-on-one consultation for product details.</p>
              </div>
            </div>
          </div>

          <p className="mt-7 text-[11px] font-medium leading-5 text-ink-600">
            Prices may vary based on current precious metal and stone conditions. Contact us for the latest information.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 border-t border-ink-700/10 pt-16 md:mt-32 md:pt-20">
          <div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className="label-eyebrow">Similar Picks</p>
              <h2 className="mt-2 font-serif text-3xl text-ink-900 md:text-4xl">Similar Designs</h2>
            </div>
            <Link
              href="/products"
              className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-ink-600 transition hover:text-ink-900 sm:inline"
            >
              Full collection -&gt;
            </Link>
          </div>
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

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

  const discount = discountPercent(product.price, product.old_price);
  const message = `Merhaba, ${product.name} (${formatPrice(product.price, product.currency)}) hakkında bilgi almak istiyorum.`;

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
    { label: "Taş", value: product.stone },
    { label: "Karat", value: product.carat },
    { label: "Yüzük Ölçüsü", value: product.ring_size },
  ].filter((spec) => spec.value);

  return (
    <article className="container-prose py-10 md:py-16">
      <Link
        href="/urunler"
        className="inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400 transition hover:text-ink-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Koleksiyona dön
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 xl:gap-20">
        <ProductGallery
          images={product.images}
          name={product.name}
          discount={discount}
        />

        <div className="lg:sticky lg:top-32 lg:h-fit">
          {product.categories && (
            <Link
              href={`/urunler?kategori=${product.categories.slug}`}
              className="label-eyebrow transition hover:text-gold-400"
            >
              {product.categories.name}
            </Link>
          )}

          <h1 className="mt-4 max-w-xl font-serif text-4xl leading-[1.05] text-ink-800 md:text-5xl xl:text-6xl">
            {product.name}
          </h1>

          <div className="mt-7 flex items-baseline gap-4 border-b border-ink-700/10 pb-7">
            <span className="font-serif text-3xl text-ink-800 md:text-4xl">
              {formatPrice(product.price, product.currency)}
            </span>
            {product.old_price && (
              <span className="text-base text-ink-300 line-through">
                {formatPrice(product.old_price, product.currency)}
              </span>
            )}
          </div>

          <div className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-ink-500">
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
            <p className="mt-7 whitespace-pre-line text-sm leading-7 text-ink-500">
              {product.description}
            </p>
          )}

          {specs.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 border-y border-ink-700/10 py-7">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-[9px] font-medium uppercase tracking-[0.18em] text-ink-400">
                    {spec.label}
                  </dt>
                  <dd className="mt-1.5 text-sm text-ink-700">{spec.value}</dd>
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
              <MessageCircle className="h-4 w-4" /> WhatsApp ile Bilgi Al
            </a>
            <a
              href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
              className="btn-outline"
            >
              <Phone className="h-4 w-4" /> Hemen Ara
            </a>
          </div>

          <div className="mt-8 grid gap-4 border-t border-ink-700/10 pt-7 sm:grid-cols-2">
            <div className="flex gap-3">
              <Diamond className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" strokeWidth={1.2} />
              <div>
                <p className="text-xs font-medium text-ink-700">Seçkin tasarım</p>
                <p className="mt-1 text-xs leading-5 text-ink-400">Detay odaklı, zamansız estetik.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" strokeWidth={1.2} />
              <div>
                <p className="text-xs font-medium text-ink-700">Kişisel destek</p>
                <p className="mt-1 text-xs leading-5 text-ink-400">Ürün detayları için birebir danışmanlık.</p>
              </div>
            </div>
          </div>

          <p className="mt-7 text-[11px] leading-5 text-ink-400">
            Fiyatlar güncel değerli metal ve taş koşullarına göre değişiklik gösterebilir. Güncel bilgi için bizimle iletişime geçiniz.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24 border-t border-ink-700/10 pt-16 md:mt-32 md:pt-20">
          <div className="mb-9 flex items-end justify-between gap-4">
            <div>
              <p className="label-eyebrow">Benzer Seçimler</p>
              <h2 className="mt-2 font-serif text-3xl text-ink-800 md:text-4xl">Benzer Tasarımlar</h2>
            </div>
            <Link
              href="/urunler"
              className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400 transition hover:text-ink-700 sm:inline"
            >
              Tüm koleksiyon →
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

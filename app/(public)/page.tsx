import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Diamond,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import { siteConfig, whatsappUrl } from "@/lib/format";
import type { Product, Category } from "@/lib/supabase/types";

export const revalidate = 60;

export default async function HomePage() {
  let featured: Product[] = [];
  let categories: Category[] = [];
  let catalogProducts: Product[] = [];

  try {
    const supabase = await createClient();
    const [{ data: featuredData }, { data: categoriesData }, { data: catalogData }] =
      await Promise.all([
        supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("categories")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("products")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(40),
      ]);

    featured = featuredData ?? [];
    categories = categoriesData ?? [];
    catalogProducts = catalogData ?? [];
  } catch {
    // Keep build/preview working when Supabase env vars are missing.
  }

  const showcaseImages = Array.from(
    new Set(catalogProducts.flatMap((product) => product.images ?? [])),
  ).slice(0, 4);

  function categoryCover(categoryId: string) {
    return catalogProducts.find(
      (product) => product.category_id === categoryId && product.images?.length > 0,
    )?.images?.[0];
  }

  return (
    <>
      <section className="overflow-hidden border-b border-[#d9b757]/20 bg-[#120b0d] text-white">
        <div className="grid min-h-[76vh] lg:grid-cols-[0.96fr_1.04fr]">
          <div className="flex items-center px-5 py-16 sm:px-10 lg:px-[max(3rem,calc((100vw-80rem)/2))] lg:py-24">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e8c768]">
                Fine Jewellery · Hawalli, Kuwait
              </p>
              <h1 className="mt-6 max-w-[11ch] font-serif text-[3.2rem] leading-[0.94] text-white sm:max-w-none sm:text-6xl lg:text-7xl">
                Jewellery made to be <span className="italic text-[#e8c768]">remembered.</span>
              </h1>
              <p className="mt-7 max-w-lg text-sm font-medium leading-7 text-white/68 sm:text-base">
                Discover refined gold and diamond jewellery selected for celebrations,
                gifting, and everyday elegance at Michael Jewellery Kuwait.
              </p>

              <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d7a52d] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#160e0e] transition hover:bg-[#efd577]"
                >
                  Explore Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappUrl("Hello Michael Jewellery, I would like to enquire about your collection.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-[#d7a52d] hover:text-[#efd577]"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>

              <div className="mt-12 grid max-w-lg grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-3 sm:gap-0">
                {[
                  ["01", "Distinctive designs"],
                  ["02", "Fine presentation"],
                  ["03", "Personal service"],
                ].map(([number, label], index) => (
                  <div
                    key={number}
                    className={index === 1 ? "sm:border-x sm:border-white/10 sm:px-6" : index === 2 ? "sm:pl-6" : ""}
                  >
                    <p className="font-serif text-2xl text-[#e8c768]">{number}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/55">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[560px] overflow-hidden bg-[radial-gradient(circle_at_65%_35%,#5f2032_0%,#2b0d17_34%,#10090b_72%)] lg:min-h-full">
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(120deg,transparent_20%,rgba(232,199,104,.16)_50%,transparent_80%)]" />
            <div className="absolute left-[12%] top-[12%] h-48 w-48 rounded-full border border-[#d7a52d]/10 sm:h-64 sm:w-64" />
            <div className="absolute right-[8%] top-[18%] h-72 w-72 rounded-full border border-[#d7a52d]/10 sm:h-96 sm:w-96" />

            <div className="absolute inset-0 flex items-center justify-center px-8 pb-28 pt-12">
              <div className="relative aspect-square w-full max-w-[430px] overflow-hidden rounded-full border border-[#d7a52d]/35 bg-white shadow-[0_30px_90px_rgba(0,0,0,.45)]">
                <Image
                  src="/michael-jewellery/michael-jewellery-logo.webp"
                  alt="Michael Jewellery"
                  fill
                  priority
                  sizes="430px"
                  className="object-contain p-7 sm:p-10"
                />
              </div>
            </div>

            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-5 rounded-2xl border border-white/10 bg-black/25 p-5 backdrop-blur-md sm:bottom-10 sm:left-10 sm:right-10">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#e8c768]">
                  Michael Jewellery
                </p>
                <p className="mt-1 font-serif text-2xl text-white sm:text-3xl">Hawalli, Kuwait</p>
              </div>
              <Link
                href="/contact"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 text-white transition hover:border-[#d7a52d] hover:bg-[#d7a52d] hover:text-black"
                aria-label="Visit Michael Jewellery contact details"
              >
                <MapPin className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/60 bg-white/60 backdrop-blur">
        <div className="container-prose grid gap-7 py-9 md:grid-cols-3 md:gap-0">
          {[
            {
              icon: Diamond,
              title: "Curated Jewellery",
              text: "Gold and diamond pieces selected for a refined catalogue.",
            },
            {
              icon: ShieldCheck,
              title: "Store Consultation",
              text: "Visit the Hawalli showroom or contact the team directly.",
            },
            {
              icon: Sparkles,
              title: "Personal Experience",
              text: "One-to-one guidance while choosing the right piece.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className={`flex items-center gap-4 px-2 md:px-8 ${index > 0 ? "md:border-l md:border-ink-700/10" : ""}`}
            >
              <item.icon className="h-6 w-6 shrink-0 text-gold-500" strokeWidth={1.2} />
              <div>
                <p className="font-serif text-lg text-ink-900">{item.title}</p>
                <p className="mt-0.5 text-xs font-medium leading-5 text-ink-700">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-prose py-20 md:py-28">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <p className="label-eyebrow">Collections</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-ink-900 md:text-5xl">
                Explore by collection.
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-2 border-b border-ink-700/30 pb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-600 transition hover:border-gold-500 hover:text-gold-600 sm:inline-flex"
            >
              Full collection <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const cover = categoryCover(category.id);
              return (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#170d10] shadow-premium"
                >
                  {cover ? (
                    <Image
                      src={cover}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_70%_25%,#5f2032_0%,#2d1019_35%,#120a0c_78%)]">
                      <div className="relative h-28 w-28 overflow-hidden rounded-full border border-[#d7a52d]/30 bg-white/95 shadow-2xl">
                        <Image
                          src="/michael-jewellery/michael-jewellery-logo.webp"
                          alt=""
                          fill
                          sizes="112px"
                          className="object-contain p-3"
                        />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-cream sm:p-7">
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold-100">Collection</p>
                    <h3 className="mt-2 font-serif text-3xl leading-none">{category.name}</h3>
                    <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-gold-300">
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {showcaseImages.length > 0 && (
        <section className="bg-gradient-to-br from-[#120b0d] via-[#2b0d17] to-[#110b0d] text-cream">
          <div className="container-prose grid items-center gap-12 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#e8c768]">
                Michael Jewellery Showcase
              </p>
              <p className="mt-5 font-serif text-4xl leading-[1.08] text-white md:text-5xl">
                A closer look at the <span className="italic text-[#e8c768]">collection.</span>
              </p>
              <p className="mt-6 max-w-lg text-sm font-medium leading-7 text-white/65">
                Selected catalogue pieces from Michael Jewellery. Product imagery is served from the live catalogue.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex items-center gap-2 border-b border-[#d7a52d] pb-1 text-[10px] uppercase tracking-[0.2em] text-[#e8c768]"
              >
                View catalogue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {showcaseImages.map((src, index) => (
                <div
                  key={src}
                  className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black ${index % 2 === 0 ? "aspect-[3/4]" : "mt-6 aspect-[3/4]"}`}
                >
                  <Image
                    src={src}
                    alt={`${siteConfig.name} jewellery showcase ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 280px, 45vw"
                    className="object-cover"
                    quality={95}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-prose py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-5">
          <div>
            <p className="label-eyebrow">Featured Pieces</p>
            <h2 className="mt-3 font-serif text-4xl text-ink-900 md:text-5xl">Latest catalogue</h2>
          </div>
          <Link
            href="/products"
            className="hidden items-center gap-2 border-b border-ink-700/30 pb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-600 transition hover:border-gold-500 hover:text-gold-600 sm:inline-flex"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : catalogProducts.length > 0 ? (
          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {catalogProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/60 bg-white/75 px-6 py-16 text-center shadow-soft backdrop-blur">
            <p className="font-serif text-2xl text-ink-900">New catalogue pieces are being prepared.</p>
            <p className="mt-2 text-sm font-medium text-ink-700">
              Visit the showroom or contact Michael Jewellery for the latest designs.
            </p>
          </div>
        )}
      </section>

      <section className="container-prose pb-20 md:pb-28">
        <div className="rounded-[2rem] border border-[#d7a52d]/20 bg-[#140c0e] px-6 py-14 text-center text-white shadow-premium sm:px-10 md:py-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#e8c768]">Visit Michael Jewellery</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight md:text-5xl">
            See the collection in Hawalli.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-white/65">
            {siteConfig.address}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#d7a52d] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-[#efd577]">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-[#d7a52d] hover:text-[#efd577]">
              Contact Details <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

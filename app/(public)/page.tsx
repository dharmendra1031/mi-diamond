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
import { getSiteAssetMap } from "@/lib/site-assets";
import { getDisplayCover } from "@/lib/product-images";
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

  const siteAssets = await getSiteAssetMap(["logo", "home_hero"]);
  const logoSrc = siteAssets.logo;
  const homeHero = siteAssets.home_hero;

  const showcaseImages = Array.from(
    new Set(catalogProducts.map((product) => getDisplayCover(product)).filter(Boolean)),
  ).slice(0, 4);
  const heroProduct =
    catalogProducts.find((product) => product.slug === "diamond-drop-necklace-set") ??
    catalogProducts.find((product) => product.slug.includes("necklace")) ??
    catalogProducts[0];
  const fallbackHeroVisual = heroProduct ? getDisplayCover(heroProduct) : showcaseImages[0];
  const heroVisual = homeHero ?? fallbackHeroVisual;

  function categoryCover(categoryId: string) {
    const product = catalogProducts.find(
      (product) => product.category_id === categoryId && product.images?.length > 0,
    );
    return product ? getDisplayCover(product) : undefined;
  }

  return (
    <>
      <section className="overflow-hidden border-b border-[#d9b757]/20 bg-[#140b0e] text-white">
        <div className="grid lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex items-center px-5 py-12 sm:px-10 lg:px-[max(3rem,calc((100vw-80rem)/2))] lg:py-24">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e8c768]">
                Michael Jewellery Kuwait
              </p>
              <h1 className="mt-5 max-w-[10ch] font-serif text-[2.85rem] leading-[0.96] text-white sm:max-w-none sm:text-6xl lg:text-7xl">
                Fine Gold & Diamond Jewellery.
              </h1>
              <p className="mt-6 max-w-[33ch] text-sm font-medium leading-7 text-white/86 sm:max-w-lg sm:text-base">
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

              <div className="mt-11 hidden max-w-lg grid-cols-3 gap-0 border-t border-white/10 pt-6 sm:grid">
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

          <div className="relative min-h-[430px] overflow-hidden border-t border-[#d9b757]/20 bg-[#241014] sm:min-h-[560px] lg:min-h-full lg:border-l lg:border-t-0">
            {heroVisual ? (
              <Image
                src={heroVisual}
                alt="Michael Jewellery fine gold and diamond jewellery"
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-center"
                quality={95}
              />
            ) : (
              <div className="flex h-full min-h-[430px] items-center justify-center font-serif text-6xl text-[#e8c768]/75">
                MJ
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#140b0e]/86 via-[#140b0e]/12 to-transparent lg:bg-gradient-to-r lg:from-[#140b0e]/34 lg:via-transparent lg:to-[#140b0e]/18" />
            <div className="absolute bottom-5 left-4 right-4 rounded-[1.35rem] border border-white/14 bg-[#160d10]/62 p-5 shadow-[0_24px_70px_rgba(14,7,9,.38)] backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-md sm:p-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#e8c768]">
                Fine Jewellery
              </p>
              <p className="mt-2 max-w-[16rem] font-serif text-xl leading-tight text-white min-[380px]:text-2xl sm:max-w-none sm:text-3xl">
                Crafted for occasions that stay with you.
              </p>
            </div>
            <Link
              href="/contact"
              className="absolute bottom-6 right-6 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 bg-[#160d10]/45 text-white backdrop-blur transition hover:border-[#d7a52d] hover:bg-[#d7a52d] hover:text-[#160d10]"
              aria-label="Visit Michael Jewellery contact details"
            >
              <MapPin className="h-4 w-4" />
            </Link>
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
                      <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-[#d7a52d]/30 bg-white/95 font-serif text-2xl text-ink-700 shadow-2xl">
                        {logoSrc ? (
                          <Image
                            src={logoSrc}
                            alt="Michael Jewellery logo"
                            fill
                            sizes="112px"
                            className="object-contain p-3"
                          />
                        ) : (
                          <span>MJ</span>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120b0d]/85 via-[#120b0d]/10 to-transparent" />
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
                  className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#120b0d] ${index % 2 === 0 ? "aspect-[3/4]" : "mt-6 aspect-[3/4]"}`}
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

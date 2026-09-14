import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Diamond, ShieldCheck, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import { siteConfig } from "@/lib/format";
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

  const heroProduct =
    featured.find((product) => product.images?.length > 0) ??
    catalogProducts.find((product) => product.images?.length > 0);
  const heroImage = heroProduct?.images?.[0];
  const editorialImage =
    catalogProducts.find(
      (product) => product.id !== heroProduct?.id && product.images?.length > 0,
    )?.images?.[0] ?? heroImage;

  function categoryCover(categoryId: string) {
    return catalogProducts.find(
      (product) => product.category_id === categoryId && product.images?.length > 0,
    )?.images?.[0];
  }

  return (
    <>
      <section className="overflow-hidden border-b border-white/50 bg-gradient-to-br from-[#f8f2e7] via-[#eee3d0] to-[#d6c6aa]">
        <div className="grid min-h-[72vh] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="min-w-0 flex items-center px-5 py-16 sm:px-10 lg:px-[max(3rem,calc((100vw-80rem)/2))] lg:py-24">
            <div className="w-full min-w-0 max-w-xl">
              <p className="label-eyebrow">Fine Jewellery / {siteConfig.name}</p>
              <h1 className="mt-5 max-w-[9ch] font-serif text-[3.05rem] leading-[0.98] text-ink-900 sm:max-w-none sm:text-6xl lg:text-7xl">
                The purest and most powerful form of <span className="italic text-gold-600">elegance</span>.
              </h1>
              <p className="mt-7 max-w-[32ch] break-words text-sm font-medium leading-7 text-ink-700 sm:max-w-lg sm:text-base">
                Selected stones, refined proportions, and expert craftsmanship. Every piece is designed as a timeless signature for life's special moments.
              </p>
              <div className="mt-9 grid w-full gap-3 sm:flex sm:flex-wrap">
                <Link href="/products" className="btn-primary w-full max-w-full px-3 text-[10px] tracking-[0.1em] sm:w-auto sm:px-6 sm:text-[11px]">
                  Explore Collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/contact" className="btn-outline w-full max-w-full px-3 text-[10px] tracking-[0.1em] sm:w-auto sm:px-6 sm:text-[11px]">
                  Private Consultation
                </Link>
              </div>

              <div className="mt-12 grid max-w-lg grid-cols-1 gap-4 border-t border-ink-700/20 pt-6 text-left sm:grid-cols-3 sm:gap-0">
                <div>
                  <p className="font-serif text-2xl text-ink-900">01</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-600">Selected stones</p>
                </div>
                <div className="sm:border-x sm:border-ink-700/15 sm:px-6">
                  <p className="font-serif text-2xl text-ink-900">02</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-600">Expert craftsmanship</p>
                </div>
                <div className="sm:pl-6">
                  <p className="font-serif text-2xl text-ink-900">03</p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-ink-600">Timeless design</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[480px] bg-ink-700 lg:min-h-full">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={heroProduct?.name ?? "Mi Diamond jewellery"}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#efe6d4] via-[#d6c3a4] to-[#1f3460]">
                <Diamond className="h-32 w-32 text-gold-400/65" strokeWidth={0.55} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-700/55 via-ink-700/10 to-transparent" />
            {heroProduct && (
              <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-4 text-white sm:bottom-10 sm:left-10 sm:right-10">
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/65">Featured piece</p>
                  <p className="mt-1 font-serif text-2xl sm:text-3xl">{heroProduct.name}</p>
                </div>
                <Link
                  href={`/products/${heroProduct.slug}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/70 bg-ink-700/35 transition hover:bg-white hover:text-ink-800"
                  aria-label={`${heroProduct.name} view product`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-white/60 bg-white/55 backdrop-blur">
        <div className="container-prose grid gap-7 py-9 md:grid-cols-3 md:gap-0">
          {[
            {
              icon: Diamond,
              title: "Refined Materials",
              text: "Carefully selected stones and precious metals.",
            },
            {
              icon: ShieldCheck,
              title: "Trusted Craftsmanship",
              text: "Precision craftsmanship focused on detail.",
            },
            {
              icon: Sparkles,
              title: "Personal Experience",
              text: "One-on-one guidance to help you find the right piece.",
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
                A piece for every story.
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
                  className="group relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-ink-700 shadow-premium"
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
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink-800 to-ink-600">
                      <Diamond className="h-28 w-28 text-gold-400/20" strokeWidth={0.5} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-800/78 via-ink-700/12 to-transparent" />
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

      <section className="bg-gradient-to-br from-ink-700 via-ink-600 to-[#314126] text-cream">
        <div className="container-prose grid items-stretch lg:grid-cols-2">
          <div className="flex items-center py-16 pr-0 sm:py-20 lg:pr-16">
            <div className="max-w-xl">
              <p className="label-eyebrow">The Art of Jewellery</p>
              <p className="mt-5 font-serif text-4xl leading-[1.08] text-cream md:text-5xl">
                True luxury is less about being noticed and more about being <span className="italic text-gold-300">remembered.</span>
              </p>
              <p className="mt-6 max-w-lg text-sm font-medium leading-7 text-cream/88">
                Our collection offers balanced proportions, refined details, and lasting beauty for every moment, from everyday elegance to special celebrations.
              </p>
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 border-b border-gold-400 pb-1 text-[10px] uppercase tracking-[0.2em] text-gold-300"
              >
                Discover our story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[560px]">
            {editorialImage ? (
              <Image
                src={editorialImage}
                alt="Mi Diamond collection"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-600">
                <Diamond className="h-28 w-28 text-gold-400/30" strokeWidth={0.5} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-prose py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-5">
          <div>
            <p className="label-eyebrow">Featured Pieces</p>
            <h2 className="mt-3 font-serif text-4xl text-ink-900 md:text-5xl">
              Featured designs
            </h2>
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
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : catalogProducts.length > 0 ? (
          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {catalogProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/60 bg-white/70 px-6 py-16 text-center shadow-soft backdrop-blur">
            <p className="font-serif text-2xl text-ink-900">New designs are being prepared.</p>
            <p className="mt-2 text-sm font-medium text-ink-700">The collection will be here very soon.</p>
          </div>
        )}
      </section>

      <section className="container-prose pb-20 md:pb-28">
        <div className="rounded-[2rem] border border-white/60 bg-white/70 px-6 py-14 text-center shadow-soft backdrop-blur sm:px-10 md:py-20">
          <p className="label-eyebrow">Private Appointment</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight text-ink-900 md:text-5xl">
            Let us choose the right jewelry together.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-7 text-ink-700">
            Contact us for personal consultation about the collection, sizing, stones, and details.
          </p>
          <Link href="/contact" className="btn-primary mt-8">
            Appointment & Contact <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

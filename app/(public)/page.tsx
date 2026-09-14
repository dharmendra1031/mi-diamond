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
    // Supabase env vars eksikse build/preview kırılmasın.
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
      <section className="overflow-hidden border-b border-ink-700/10 bg-[#f5f1e9]">
        <div className="grid min-h-[72vh] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex items-center px-5 py-16 sm:px-10 lg:px-[max(3rem,calc((100vw-80rem)/2))] lg:py-24">
            <div className="max-w-xl">
              <p className="label-eyebrow">Fine Jewellery · {siteConfig.name}</p>
              <h1 className="mt-5 font-serif text-5xl leading-[0.98] text-ink-800 sm:text-6xl lg:text-7xl">
                Zarafetin en <span className="italic text-gold-600">sade</span> ve en güçlü hali.
              </h1>
              <p className="mt-7 max-w-lg text-sm leading-7 text-ink-500 sm:text-base">
                Seçkin taşlar, rafine oranlar ve usta işçilik. Her parça, hayatınızın özel anlarına eşlik edecek zamansız bir imza olarak tasarlanır.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/urunler" className="btn-primary">
                  Koleksiyonu Keşfet <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/iletisim" className="btn-outline">
                  Özel Danışmanlık
                </Link>
              </div>

              <div className="mt-12 grid max-w-lg grid-cols-3 border-t border-ink-700/15 pt-6 text-center sm:text-left">
                <div>
                  <p className="font-serif text-2xl text-ink-700">01</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-ink-400">Seçkin taşlar</p>
                </div>
                <div className="border-x border-ink-700/10 px-3 sm:pl-6">
                  <p className="font-serif text-2xl text-ink-700">02</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-ink-400">Usta işçilik</p>
                </div>
                <div className="pl-3 sm:pl-6">
                  <p className="font-serif text-2xl text-ink-700">03</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-ink-400">Zamansız tasarım</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[480px] bg-ink-100 lg:min-h-full">
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
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white via-[#f0ece3] to-[#ded6c8]">
                <Diamond className="h-32 w-32 text-gold-400/65" strokeWidth={0.55} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/35 via-transparent to-transparent" />
            {heroProduct && (
              <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-4 text-white sm:bottom-10 sm:left-10 sm:right-10">
                <div>
                  <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/65">Featured piece</p>
                  <p className="mt-1 font-serif text-2xl sm:text-3xl">{heroProduct.name}</p>
                </div>
                <Link
                  href={`/urunler/${heroProduct.slug}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center border border-white/60 transition hover:bg-white hover:text-ink-800"
                  aria-label={`${heroProduct.name} ürününü incele`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-ink-700/10 bg-white">
        <div className="container-prose grid gap-7 py-9 md:grid-cols-3 md:gap-0">
          {[
            {
              icon: Diamond,
              title: "Seçkin Materyaller",
              text: "Özenle seçilmiş taş ve değerli metaller.",
            },
            {
              icon: ShieldCheck,
              title: "Güven Veren İşçilik",
              text: "Detaylara odaklanan hassas üretim anlayışı.",
            },
            {
              icon: Sparkles,
              title: "Kişisel Deneyim",
              text: "Doğru parçayı bulmanız için birebir danışmanlık.",
            },
          ].map((item, index) => (
            <div
              key={item.title}
              className={`flex items-center gap-4 px-2 md:px-8 ${index > 0 ? "md:border-l md:border-ink-700/10" : ""}`}
            >
              <item.icon className="h-6 w-6 shrink-0 text-gold-500" strokeWidth={1.2} />
              <div>
                <p className="font-serif text-lg text-ink-700">{item.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-ink-400">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container-prose py-20 md:py-28">
          <div className="mb-10 flex items-end justify-between gap-5">
            <div>
              <p className="label-eyebrow">Koleksiyonlar</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight text-ink-800 md:text-5xl">
                Her hikâyeye özel bir parça.
              </h2>
            </div>
            <Link
              href="/urunler"
              className="hidden items-center gap-2 border-b border-ink-700/30 pb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-600 transition hover:border-gold-500 hover:text-gold-600 sm:inline-flex"
            >
              Tüm koleksiyon <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const cover = categoryCover(category.id);
              return (
                <Link
                  key={category.id}
                  href={`/urunler?kategori=${category.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden bg-ink-800"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-cream sm:p-7">
                    <p className="text-[9px] uppercase tracking-[0.22em] text-cream/60">Collection</p>
                    <h3 className="mt-2 font-serif text-3xl leading-none">{category.name}</h3>
                    <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-gold-300">
                      Keşfet <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="bg-ink-900 text-cream">
        <div className="container-prose grid items-stretch lg:grid-cols-2">
          <div className="flex items-center py-16 pr-0 sm:py-20 lg:pr-16">
            <div className="max-w-xl">
              <p className="label-eyebrow">The Art of Jewellery</p>
              <p className="mt-5 font-serif text-4xl leading-[1.08] text-cream md:text-5xl">
                Gerçek lüks, dikkat çekmekten çok <span className="italic text-gold-300">hatırlanmaktır.</span>
              </p>
              <p className="mt-6 max-w-lg text-sm leading-7 text-cream/60">
                Koleksiyonumuz, günlük zarafetten özel kutlamalara kadar her an için dengeli oranlar, rafine detaylar ve uzun ömürlü estetik sunar.
              </p>
              <Link
                href="/hakkimizda"
                className="mt-8 inline-flex items-center gap-2 border-b border-gold-400 pb-1 text-[10px] uppercase tracking-[0.2em] text-gold-300"
              >
                Hikâyemizi keşfedin <ArrowRight className="h-3.5 w-3.5" />
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
              <div className="absolute inset-0 flex items-center justify-center bg-ink-800">
                <Diamond className="h-28 w-28 text-gold-400/30" strokeWidth={0.5} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container-prose py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-5">
          <div>
            <p className="label-eyebrow">Seçkin Parçalar</p>
            <h2 className="mt-3 font-serif text-4xl text-ink-800 md:text-5xl">
              Öne çıkan tasarımlar
            </h2>
          </div>
          <Link
            href="/urunler"
            className="hidden items-center gap-2 border-b border-ink-700/30 pb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-600 transition hover:border-gold-500 hover:text-gold-600 sm:inline-flex"
          >
            Tümünü Gör <ArrowRight className="h-3.5 w-3.5" />
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
          <div className="border border-ink-700/10 bg-white px-6 py-16 text-center">
            <p className="font-serif text-2xl text-ink-700">Yeni tasarımlar hazırlanıyor.</p>
            <p className="mt-2 text-sm text-ink-400">Koleksiyon çok yakında burada olacak.</p>
          </div>
        )}
      </section>

      <section className="container-prose pb-20 md:pb-28">
        <div className="border border-ink-700/10 bg-white px-6 py-14 text-center sm:px-10 md:py-20">
          <p className="label-eyebrow">Private Appointment</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight text-ink-800 md:text-5xl">
            Doğru mücevheri birlikte seçelim.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-ink-500">
            Koleksiyon, ölçü, taş ve detaylar hakkında kişisel danışmanlık için bizimle iletişime geçin.
          </p>
          <Link href="/iletisim" className="btn-primary mt-8">
            Randevu & İletişim <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product-card";
import type { Product, Category } from "@/lib/supabase/types";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    metal?: string;
    stone?: string;
    min?: string;
    max?: string;
    discount?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const categorySlug = params.category;
  const sort = params.sort ?? "new";
  const metalFilter = params.metal;
  const stoneFilter = params.stone;
  const minPrice = params.min ? parseFloat(params.min) : null;
  const maxPrice = params.max ? parseFloat(params.max) : null;
  const onlyDiscount = params.discount === "1";

  let products: Product[] = [];
  let categories: Category[] = [];
  let activeCategory: Category | null = null;
  let metals: string[] = [];
  let stones: string[] = [];

  try {
    const supabase = await createClient();

    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    categories = cats ?? [];
    activeCategory = categories.find((c) => c.slug === categorySlug) ?? null;

    let query = supabase
      .from("products")
      .select("*")
      .eq("is_published", true);

    if (activeCategory) query = query.eq("category_id", activeCategory.id);
    if (metalFilter) query = query.eq("metal", metalFilter);
    if (stoneFilter) query = query.eq("stone", stoneFilter);
    if (minPrice !== null) query = query.gte("price", minPrice);
    if (maxPrice !== null) query = query.lte("price", maxPrice);
    if (onlyDiscount) query = query.not("old_price", "is", null);

    switch (sort) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data } = await query;
    products = data ?? [];

    // Build filter options from the full published catalog.
    const { data: distinctData } = await supabase
      .from("products")
      .select("metal, stone")
      .eq("is_published", true);
    metals = Array.from(
      new Set((distinctData ?? []).map((p) => p.metal).filter(Boolean) as string[]),
    ).sort();
    stones = Array.from(
      new Set((distinctData ?? []).map((p) => p.stone).filter(Boolean) as string[]),
    ).sort();
  } catch {
    // Render an empty list if env vars are missing.
  }

  function buildHref(overrides: Record<string, string | undefined>) {
    const sp = new URLSearchParams();
    const next = { ...params, ...overrides };
    Object.entries(next).forEach(([k, v]) => {
      if (v) sp.set(k, v);
    });
    const qs = sp.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="container-prose py-12 md:py-16">
      <header className="mb-10">
        <p className="label-eyebrow">Collection</p>
        <h1 className="mt-2 font-serif text-4xl text-ink-900 md:text-5xl">
          {activeCategory ? activeCategory.name : "All Products"}
        </h1>
        {activeCategory?.description && (
          <p className="mt-3 max-w-2xl text-ink-500">
            {activeCategory.description}
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar filters */}
        <aside className="max-h-[430px] space-y-4 overflow-auto rounded-[1.35rem] border border-white/70 bg-white/45 p-3 shadow-soft backdrop-blur lg:sticky lg:top-28 lg:h-fit lg:max-h-none lg:space-y-6 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <FilterGroup title="Category">
            <ul className="space-y-1.5 text-sm">
              <li>
                <Link
                  href={buildHref({ category: undefined })}
                  className={!activeCategory ? "font-medium text-ink-700" : "text-ink-500 hover:text-ink-700"}
                >
                  All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={buildHref({ category: c.slug })}
                    className={
                      activeCategory?.id === c.id
                        ? "font-medium text-ink-700"
                        : "text-ink-500 hover:text-ink-700"
                    }
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </FilterGroup>

          {metals.length > 0 && (
            <FilterGroup title="Metal">
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link
                    href={buildHref({ metal: undefined })}
                    className={!metalFilter ? "font-medium text-ink-700" : "text-ink-500 hover:text-ink-700"}
                  >
                    All
                  </Link>
                </li>
                {metals.map((m) => (
                  <li key={m}>
                    <Link
                      href={buildHref({ metal: m })}
                      className={
                        metalFilter === m
                          ? "font-medium text-ink-700"
                          : "text-ink-500 hover:text-ink-700"
                      }
                    >
                      {m}
                    </Link>
                  </li>
                ))}
              </ul>
            </FilterGroup>
          )}

          {stones.length > 0 && (
            <FilterGroup title="Stone">
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link
                    href={buildHref({ stone: undefined })}
                    className={!stoneFilter ? "font-medium text-ink-700" : "text-ink-500 hover:text-ink-700"}
                  >
                    All
                  </Link>
                </li>
                {stones.map((s) => (
                  <li key={s}>
                    <Link
                      href={buildHref({ stone: s })}
                      className={
                        stoneFilter === s
                          ? "font-medium text-ink-700"
                          : "text-ink-500 hover:text-ink-700"
                      }
                    >
                      {s}
                    </Link>
                  </li>
                ))}
              </ul>
            </FilterGroup>
          )}

          <FilterGroup title="Price Range">
            <form action="/products" method="get" className="space-y-2">
              {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
              {metalFilter && <input type="hidden" name="metal" value={metalFilter} />}
              {stoneFilter && <input type="hidden" name="stone" value={stoneFilter} />}
              <div className="flex gap-2">
                <input
                  name="min"
                  type="number"
                  defaultValue={params.min}
                  placeholder="Min price"
                  className="w-full rounded-xl border border-ink-700/20 bg-white/85 px-3 py-2 text-sm font-medium text-ink-900 placeholder:text-ink-300 focus:border-gold-500 focus:outline-none"
                />
                <input
                  name="max"
                  type="number"
                  defaultValue={params.max}
                  placeholder="Max price"
                  className="w-full rounded-xl border border-ink-700/20 bg-white/85 px-3 py-2 text-sm font-medium text-ink-900 placeholder:text-ink-300 focus:border-gold-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-ink-700 py-2 text-xs font-medium text-cream hover:bg-ink-600"
              >
                Apply
              </button>
            </form>
          </FilterGroup>

          <FilterGroup title="Other">
            <Link
              href={buildHref({ discount: onlyDiscount ? undefined : "1" })}
              className={`text-sm ${onlyDiscount ? "font-medium text-gold-500" : "text-ink-500 hover:text-ink-700"}`}
            >
              {onlyDiscount ? "Selected / " : ""}Discounted Products Only
            </Link>
          </FilterGroup>

          {(metalFilter || stoneFilter || minPrice || maxPrice || onlyDiscount) && (
            <Link
              href={activeCategory ? `/products?category=${activeCategory.slug}` : "/products"}
              className="block text-center text-xs text-ink-400 hover:text-ink-700"
            >
              Clear Filters
            </Link>
          )}
        </aside>

        <div>
          <div className="mb-6 flex flex-col gap-3 border-b border-ink-700/10 pb-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="text-ink-500">{products.length} products</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-ink-500">Sort:</span>
              {[
                { v: "new", label: "New" },
                { v: "price_asc", label: "Low to High" },
                { v: "price_desc", label: "High to Low" },
              ].map((s) => (
                <Link
                  key={s.v}
                  href={buildHref({ sort: s.v })}
                  className={
                    sort === s.v
                      ? "font-medium text-ink-700"
                      : "text-ink-400 hover:text-ink-700"
                  }
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-ink-200 bg-white/70 p-16 text-center shadow-soft backdrop-blur">
              <p className="font-medium text-ink-700">
                No products match these criteria.
              </p>
              <Link href="/products" className="mt-4 inline-block text-gold-500 hover:underline">
                Clear filters -&gt;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/70 bg-white/78 p-5 shadow-soft backdrop-blur">
      <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-600">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

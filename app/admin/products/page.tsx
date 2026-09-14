import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Star, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { discountPercent, formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ q?: string; featured?: string }>;
};

export default async function AdminProductsPage({ searchParams }: Props) {
  const { q, featured } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, categories(name, slug)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("name", `%${q}%`);
  }
  if (featured === "1") {
    query = query.eq("is_featured", true);
  }

  const { data: products } = await query;

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink-700">Products</h1>
          <p className="mt-1 text-sm text-ink-500">
            {products?.length ?? 0} products listed
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New Product
        </Link>
      </header>

      <form action="/admin/products" method="get" className="mt-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products..."
          className="w-full max-w-md rounded-lg border border-ink-200 bg-white px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
        />
      </form>

      <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-700/10 bg-cream/40 text-left">
            <tr>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">
                Product
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400 text-right">
                Fiyat
              </th>
              <th className="hidden sm:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">
                Status
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700/5">
            {products?.map((p) => {
              const discount = discountPercent(p.price, p.old_price);
              return (
                <tr key={p.id} className="hover:bg-cream/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-ink-50 shrink-0">
                        {p.images[0] ? (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-ink-300">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-700">
                          {p.name}
                        </p>
                        <p className="truncate text-xs text-ink-400">
                          /{p.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-ink-500">
                    {p.categories?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium text-ink-700">
                      {formatPrice(p.price, p.currency)}
                    </div>
                    {discount && (
                      <div className="text-xs text-gold-500">
                        %{discount} off
                      </div>
                    )}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {p.is_featured && (
                        <span title="Featured">
                          <Star className="h-4 w-4 text-gold-400 fill-current" />
                        </span>
                      )}
                      {!p.is_published && (
                        <span title="Not published">
                          <EyeOff className="h-4 w-4 text-ink-300" />
                        </span>
                      )}
                      <span
                        className={`text-xs ${
                          p.stock_status === "available"
                            ? "text-emerald-600"
                            : p.stock_status === "sold_out"
                              ? "text-red-500"
                              : "text-gold-500"
                        }`}
                      >
                        {p.stock_status === "available"
                          ? "In Stock"
                          : p.stock_status === "sold_out"
                            ? "Sold Out"
                            : "Made to Order"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-ink-400">
                  {q ? "No products matched your search." : "No products have been added yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

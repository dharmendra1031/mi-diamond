import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CategoryRow } from "./category-row";
import { CategoryForm } from "./category-form";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("sort_order");

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-ink-700">Categoryler</h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage product categories on the site.
          </p>
        </div>
      </header>

      {ok && (
        <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Kaydedildi.
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl bg-white shadow-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-700/10 bg-cream/40 text-left">
              <tr>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">Order</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">Name</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">Slug</th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400 text-right">Product</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-700/5">
              {categories?.map((c) => (
                <CategoryRow
                  key={c.id}
                  id={c.id}
                  name={c.name}
                  slug={c.slug}
                  sort_order={c.sort_order}
                  productCount={c.products?.[0]?.count ?? 0}
                />
              ))}
              {(!categories || categories.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink-400">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="rounded-2xl bg-white p-6 shadow-soft lg:sticky lg:top-10 lg:h-fit">
          <h2 className="font-serif text-lg text-ink-700 flex items-center gap-2">
            <Plus className="h-4 w-4 text-gold-500" /> New Category
          </h2>
          <CategoryForm />
        </aside>
      </div>
    </>
  );
}

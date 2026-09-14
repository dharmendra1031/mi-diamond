import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Tags,
  Star,
  EyeOff,
  Plus,
  ArrowRight,
  Diamond,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { formatPrice, siteConfig } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { profile } = await getCurrentProfile();

  const [
    { count: productCount },
    { count: publishedCount },
    { count: featuredCount },
    { count: soldOutCount },
    { count: categoryCount },
    { data: recentProducts },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_featured", true),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("stock_status", "sold_out"),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id, name, slug, images, price, currency, is_published, is_featured, stock_status")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-400">Michael Jewellery Catalogue</p>
          <h1 className="mt-1 font-serif text-3xl text-ink-700">
            Welcome, {profile?.full_name || "Admin"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-500">
            Manage the products, prices, photos and categories shown on the {siteConfig.name} website.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Package} label="Products" value={productCount ?? 0} />
        <StatCard icon={Diamond} label="Published" value={publishedCount ?? 0} />
        <StatCard icon={Star} label="Featured" value={featuredCount ?? 0} />
        <StatCard icon={Tags} label="Categories" value={categoryCount ?? 0} />
        <StatCard icon={EyeOff} label="Sold Out" value={soldOutCount ?? 0} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl text-ink-700">Recent Products</h2>
              <p className="mt-1 text-xs text-ink-400">Latest catalogue items added from the admin panel.</p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-700"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentProducts && recentProducts.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {recentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center gap-3 rounded-xl border border-ink-700/5 p-3 transition hover:bg-cream/50"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Diamond className="h-5 w-5 text-ink-200" strokeWidth={1.1} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-ink-700">{product.name}</p>
                      {product.is_featured && <Star className="h-3 w-3 shrink-0 fill-gold-400 text-gold-400" />}
                      {!product.is_published && <EyeOff className="h-3 w-3 shrink-0 text-ink-300" />}
                    </div>
                    <p className="mt-1 text-xs text-ink-400">
                      {formatPrice(product.price, product.currency || "KWD")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-ink-400">
              <Diamond className="mx-auto h-9 w-9 text-ink-200" strokeWidth={1} />
              <p className="mt-3">No products have been added yet.</p>
              <Link href="/admin/products/new" className="mt-3 inline-block text-gold-600 hover:underline">
                Add the first product
              </Link>
            </div>
          )}
        </div>

        <aside className="rounded-2xl bg-gradient-to-br from-[#180c10] to-[#3a1020] p-6 text-white shadow-soft">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-300">Quick Actions</p>
          <h2 className="mt-2 font-serif text-2xl">Catalogue Management</h2>
          <div className="mt-6 space-y-3">
            <QuickLink href="/admin/products/new" icon={Plus} label="Add a new product" />
            <QuickLink href="/admin/products" icon={Package} label="Manage products" />
            <QuickLink href="/admin/categories" icon={Tags} label="Manage categories" />
            <QuickLink href="/" icon={ArrowRight} label="Open website" external />
          </div>
          <p className="mt-8 border-t border-white/10 pt-5 text-xs leading-5 text-white/55">
            Product images, description, price, category and availability can be updated from this panel.
          </p>
        </aside>
      </section>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 text-gold-500" strokeWidth={1.4} />
        <span className="font-serif text-3xl text-ink-700">{value}</span>
      </div>
      <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-ink-400">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  external = false,
}: {
  href: string;
  icon: typeof Plus;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 transition hover:border-gold-400/40 hover:bg-gold-400/10 hover:text-white"
    >
      <Icon className="h-4 w-4 text-gold-400" />
      <span>{label}</span>
    </Link>
  );
}

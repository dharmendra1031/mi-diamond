import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Tags,
  ShoppingBag,
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  Star,
  Mail,
  Plus,
  Layers,
  DollarSign,
  Eye,
  EyeOff,
  Diamond,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  shipped: "Shipping",
  completed: "Completed",
  cancelled: "Cancel",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  new: "bg-emerald-500",
  contacted: "bg-blue-500",
  confirmed: "bg-indigo-500",
  shipped: "bg-purple-500",
  completed: "bg-ink-700",
  cancelled: "bg-red-500",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { profile } = await getCurrentProfile();

  // Tarihler
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const prev30 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: productCount },
    { count: publishedCount },
    { count: featuredCount },
    { count: soldOutCount },
    { count: categoryCount },
    { count: newslettersCount },
    { count: newOrdersCount },
    { data: ordersThisMonth },
    { data: ordersPrevMonth },
    { data: recentOrders },
    { data: lowStockProducts },
    { data: recentProducts },
    { data: allOrdersForStatus },
    { data: recentNewsletters },
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
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("orders")
      .select("total, status")
      .gte("created_at", last30),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", prev30)
      .lt("created_at", last30),
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("products")
      .select("id, name, slug, images, stock_status")
      .or("stock_status.eq.sold_out,stock_status.eq.on_request")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("products")
      .select("id, name, slug, images, price, currency, is_published, is_featured")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("status")
      .neq("status", "cancelled"),
    supabase
      .from("newsletter_subscribers")
      .select("email, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const monthRevenue =
    ordersThisMonth?.reduce(
      (sum, o) =>
        ["confirmed", "shipped", "completed"].includes(o.status as string)
          ? sum + Number(o.total)
          : sum,
      0,
    ) ?? 0;
  const prevRevenue =
    ordersPrevMonth?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
  const revenueDelta = prevRevenue
    ? Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100)
    : null;

  const monthOrderCount = ordersThisMonth?.length ?? 0;
  const prevOrderCount = ordersPrevMonth?.length ?? 0;
  const orderDelta = prevOrderCount
    ? Math.round(((monthOrderCount - prevOrderCount) / prevOrderCount) * 100)
    : null;

  // Status distribution for active orders, excluding cancelled orders.
  const statusGroups: Record<string, number> = {};
  (allOrdersForStatus ?? []).forEach((o) => {
    statusGroups[o.status as string] = (statusGroups[o.status as string] ?? 0) + 1;
  });
  const totalActive =
    Object.values(statusGroups).reduce((a, b) => a + b, 0) || 1;

  return (
    <>
      {/* Greeting */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-ink-400">{greeting()},</p>
          <h1 className="font-serif text-3xl text-ink-700">
            {profile?.full_name || "Admin"} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Last 30 days summary - today{" "}
            {now.toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" /> New Product Add
        </Link>
      </header>

      {/* Stat cards */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Revenue (Confirmed)"
          value={formatPrice(monthRevenue)}
          delta={revenueDelta}
          tone="gold"
        />
        <StatCard
          icon={ShoppingBag}
          label="Order Requests"
          value={String(monthOrderCount)}
          delta={orderDelta}
          tone="ink"
          href="/admin/orders"
        />
        <StatCard
          icon={Package}
          label="Publishingdaki Product"
          value={`${publishedCount ?? 0} / ${productCount ?? 0}`}
          tone="muted"
          href="/admin/products"
        />
        <StatCard
          icon={AlertTriangle}
          label="New Talep"
          value={String(newOrdersCount ?? 0)}
          tone={(newOrdersCount ?? 0) > 0 ? "alert" : "muted"}
          href="/admin/orders?status=new"
          accent={(newOrdersCount ?? 0) > 0}
        />
      </section>

      {/* Two column: status + quick actions */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg text-ink-700">Request Statuses</h2>
              <p className="text-xs text-ink-400">
                Status of active orders (excluding cancelled)
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs text-ink-500 hover:text-ink-700"
            >
              All →
            </Link>
          </div>

          {Object.keys(statusGroups).length > 0 ? (
            <div className="mt-6 space-y-3">
              {(Object.keys(STATUS_LABEL) as OrderStatus[])
                .filter((s) => s !== "cancelled" && (statusGroups[s] ?? 0) > 0)
                .map((status) => {
                  const count = statusGroups[status];
                  const pct = (count / totalActive) * 100;
                  return (
                    <Link
                      key={status}
                      href={`/admin/orders?status=${status}`}
                      className="block group"
                    >
                      <div className="flex items-baseline justify-between text-xs text-ink-500 mb-1.5">
                        <span className="group-hover:text-ink-700">
                          {STATUS_LABEL[status]}
                        </span>
                        <span className="text-ink-700 font-medium">
                          {count}{" "}
                          <span className="text-ink-300">
                            ({Math.round(pct)}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-ink-50 overflow-hidden">
                        <div
                          className={`h-full ${STATUS_COLOR[status]} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
            </div>
          ) : (
            <div className="mt-8 text-center py-8 text-sm text-ink-400">
              <Layers className="mx-auto h-8 w-8 text-ink-200" strokeWidth={1.2} />
              <p className="mt-2">No active order requests yet.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-ink-700 to-ink-600 p-6 text-cream shadow-soft">
          <h2 className="font-serif text-lg flex items-center gap-2">
            <Diamond className="h-4 w-4 text-gold-400" /> Quick Actions
          </h2>
          <ul className="mt-5 space-y-2">
            <QuickAction
              href="/admin/products/new"
              icon={Plus}
              label="New products ekle"
              hint="Photo + price"
            />
            <QuickAction
              href="/admin/products"
              icon={Package}
              label="Manage products"
              hint={`${productCount ?? 0} products`}
            />
            <QuickAction
              href="/admin/categories"
              icon={Tags}
              label="Edit categories"
              hint={`${categoryCount ?? 0} categories`}
            />
            <QuickAction
              href="/admin/orders"
              icon={ShoppingBag}
              label="View requests"
              hint={`${newOrdersCount ?? 0} yeni`}
              highlight={(newOrdersCount ?? 0) > 0}
            />
          </ul>
        </div>
      </section>

      {/* Recent orders + Low stock */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink-700">Son Talepler</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-ink-500 hover:text-ink-700"
            >
              All →
            </Link>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <ul className="mt-4 divide-y divide-ink-700/5">
              {(recentOrders as Order[]).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between py-3 hover:bg-cream/40 -mx-2 px-2 rounded transition"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-ink-700 truncate">
                        {o.customer_name}
                        <span className="ml-2 text-xs text-ink-300 font-mono">
                          #{o.order_number}
                        </span>
                      </p>
                      <p className="text-xs text-ink-400 mt-0.5">
                        {new Date(o.created_at).toLocaleDateString("tr-TR")} •{" "}
                        {o.items.length} products
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${STATUS_COLOR[o.status]} mr-2`}
                      />
                      <span className="text-sm font-medium text-ink-700">
                        {formatPrice(o.total, o.currency)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-8 text-center py-8 text-sm text-ink-400">
              <ShoppingBag
                className="mx-auto h-8 w-8 text-ink-200"
                strokeWidth={1.2}
              />
              <p className="mt-2">No requests yet.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h2 className="font-serif text-lg text-ink-700">Stock Alerts</h2>
          </div>
          <p className="text-xs text-ink-400 mt-1">
            Sold-out or made-to-order products
          </p>

          {lowStockProducts && lowStockProducts.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {lowStockProducts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center gap-3 -mx-2 px-2 py-2 rounded hover:bg-cream/40 transition"
                  >
                    <div className="relative h-10 w-10 rounded-lg bg-ink-50 overflow-hidden shrink-0">
                      {p.images?.[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-700 truncate">
                        {p.name}
                      </p>
                      <p
                        className={`text-xs ${
                          p.stock_status === "sold_out"
                            ? "text-red-500"
                            : "text-amber-500"
                        }`}
                      >
                        {p.stock_status === "sold_out"
                          ? "Sold Out"
                          : "Made to Order"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 text-center py-6 text-sm text-ink-400">
              <p>✓ Stok problemi yok</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent products + Newsletter */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-lg text-ink-700">Recently Added Products</h2>
            <Link
              href="/admin/products"
              className="text-xs text-ink-500 hover:text-ink-700"
            >
              All →
            </Link>
          </div>

          {recentProducts && recentProducts.length > 0 ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {recentProducts.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-cream/40 transition"
                  >
                    <div className="relative h-12 w-12 rounded-lg bg-ink-50 overflow-hidden shrink-0">
                      {p.images?.[0] && (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink-700 truncate flex items-center gap-1.5">
                        {p.name}
                        {p.is_featured && (
                          <Star className="h-3 w-3 text-gold-400 fill-current" />
                        )}
                        {!p.is_published && (
                          <EyeOff className="h-3 w-3 text-ink-300" />
                        )}
                      </p>
                      <p className="text-xs text-ink-400">
                        {formatPrice(p.price, p.currency)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 text-center py-8 text-sm text-ink-400">
              <Package className="mx-auto h-8 w-8 text-ink-200" strokeWidth={1.2} />
              <p className="mt-2">No products yet.</p>
              <Link
                href="/admin/products/new"
                className="text-gold-500 hover:underline mt-2 inline-block"
              >
                Add the first product →
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-cream/40 p-6 border border-ink-700/5">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gold-500" />
            <h2 className="font-serif text-lg text-ink-700">Newsletter Subscribers</h2>
          </div>
          <p className="mt-3 text-3xl font-medium text-ink-700">
            {newslettersCount ?? 0}
          </p>
          <p className="text-xs text-ink-400">aktif abone</p>

          {recentNewsletters && recentNewsletters.length > 0 && (
            <ul className="mt-5 space-y-2 text-xs text-ink-500 border-t border-ink-700/5 pt-3">
              {recentNewsletters.map((n) => (
                <li key={n.email} className="flex justify-between truncate">
                  <span className="truncate">{n.email}</span>
                  <span className="text-ink-300 ml-2 shrink-0">
                    {new Date(n.created_at).toLocaleDateString("tr-TR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Quick stats footer */}
      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <MiniStat
          label="Featured"
          value={featuredCount ?? 0}
          icon={Star}
          accent="gold"
        />
        <MiniStat
          label="Sold Out"
          value={soldOutCount ?? 0}
          icon={EyeOff}
          accent="red"
        />
        <MiniStat
          label="Category"
          value={categoryCount ?? 0}
          icon={Tags}
          accent="ink"
        />
      </section>
    </>
  );
}

// --- Components ---

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  tone,
  href,
  accent,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  delta?: number | null;
  tone: "gold" | "ink" | "muted" | "alert";
  href?: string;
  accent?: boolean;
}) {
  const toneClasses = {
    gold: "bg-gradient-to-br from-gold-400 to-gold-500 text-ink-700",
    ink: "bg-white text-ink-700",
    muted: "bg-white text-ink-700",
    alert: "bg-red-50 text-red-700 ring-1 ring-red-200",
  }[tone];

  const className = `rounded-2xl p-5 shadow-soft transition ${toneClasses} ${
    href ? "hover:shadow-md" : ""
  } ${accent ? "ring-2 ring-red-300 animate-pulse" : ""}`;

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <Icon className="h-5 w-5 opacity-80" />
        {delta !== null && delta !== undefined && (
          <span
            className={`text-xs font-medium inline-flex items-center gap-0.5 ${
              delta >= 0 ? "text-emerald-600" : "text-red-600"
            } ${tone === "gold" ? "text-ink-700" : ""}`}
          >
            <TrendingUp
              className={`h-3 w-3 ${delta < 0 ? "rotate-180" : ""}`}
            />
            {delta > 0 ? "+" : ""}
            {delta}%
          </span>
        )}
      </div>
      <p className="mt-5 text-2xl font-medium tracking-tight">{value}</p>
      <p
        className={`text-xs mt-1 ${
          tone === "gold" ? "text-ink-700/70" : "text-ink-400"
        }`}
      >
        {label}
      </p>
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  hint,
  highlight,
}: {
  href: string;
  icon: typeof Plus;
  label: string;
  hint: string;
  highlight?: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
          highlight
            ? "bg-gold-400 text-ink-700 hover:bg-gold-300"
            : "bg-white/5 hover:bg-white/10 text-cream"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            highlight ? "text-ink-700" : "text-gold-400"
          }`}
        />
        <span className="flex-1">{label}</span>
        <span
          className={`text-xs ${
            highlight ? "text-ink-700/70" : "text-cream/50"
          }`}
        >
          {hint}
        </span>
        <ArrowRight
          className={`h-3.5 w-3.5 ${
            highlight ? "text-ink-700/50" : "text-cream/40"
          }`}
        />
      </Link>
    </li>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Star;
  accent: "gold" | "red" | "ink";
}) {
  const dotColor = {
    gold: "text-gold-500",
    red: "text-red-500",
    ink: "text-ink-500",
  }[accent];

  return (
    <div className="rounded-xl bg-white p-4 shadow-soft flex items-center gap-3">
      <div className={`${dotColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-medium text-ink-700">{value}</p>
        <p className="text-xs text-ink-400">{label}</p>
      </div>
    </div>
  );
}

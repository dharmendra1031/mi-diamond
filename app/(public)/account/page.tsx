import Link from "next/link";
import { ArrowRight, Package, Settings, UserCircle, Gem } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Request Received",
  contacted: "Contacted",
  confirmed: "Confirmed",
  shipped: "Shipping",
  completed: "Completed",
  cancelled: "Cancel",
};

export default async function AccountDashboardPage() {
  const { user, profile } = await getCurrentProfile();
  const supabase = await createClient();
  const isAdmin = profile?.is_admin ?? false;

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  return (
    <>
      <header>
        <h1 className="font-serif text-3xl text-ink-700">My Account</h1>
        <p className="mt-1 text-sm text-ink-500">
          Welcome! You can manage your order history and account details
          from here.
        </p>
      </header>

      {isAdmin && (
        <Link
          href="/admin"
          className="mt-6 flex items-center gap-3 rounded-2xl bg-ink-700 p-4 text-cream shadow-soft hover:bg-ink-600 transition"
        >
          <Settings className="h-5 w-5 text-gold-400" />
          <div className="flex-1">
            <p className="font-medium">Go to Admin Panel</p>
            <p className="text-xs text-cream/70">
              Manage products, categories, and order requests
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-gold-400" />
        </Link>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          href="/account/orders"
          className="rounded-2xl bg-white p-5 shadow-soft hover:shadow-md transition"
        >
          <Package className="h-5 w-5 text-gold-500" />
          <p className="mt-4 text-3xl font-medium text-ink-700">
            {totalOrders ?? 0}
          </p>
          <p className="text-xs uppercase tracking-[0.15em] text-ink-400 mt-1">
            Order Requests
          </p>
        </Link>

        <Link
          href="/account/details"
          className="rounded-2xl bg-white p-5 shadow-soft hover:shadow-md transition"
        >
          <UserCircle className="h-5 w-5 text-gold-500" />
          <p className="mt-4 font-medium text-ink-700">My Details</p>
          <p className="text-xs text-ink-400 mt-1">Update your profile</p>
        </Link>

        <Link
          href="/products"
          className="rounded-2xl bg-white p-5 shadow-soft hover:shadow-md transition"
        >
          <Gem className="h-5 w-5 text-gold-500" />
          <p className="mt-4 font-medium text-ink-700">Collection</p>
          <p className="text-xs text-ink-400 mt-1">Browse products and prices</p>
        </Link>
      </section>

      <section className="mt-10 rounded-2xl bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-ink-700">My Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-xs text-ink-500 hover:text-ink-700 inline-flex items-center gap-1"
          >
            All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-ink-700/10">
          {(orders as Order[] | null)?.map((o) => (
            <li
              key={o.id}
              className="py-4 flex flex-wrap items-center gap-3 justify-between"
            >
              <div className="min-w-0">
                <Link
                  href={`/account/orders/${o.id}`}
                  className="font-medium text-ink-700 hover:text-gold-500"
                >
                  #{o.order_number}
                </Link>
                <p className="text-xs text-ink-400">
                  {new Date(o.created_at).toLocaleDateString("tr-TR")} —{" "}
                  {STATUS_LABEL[o.status]}
                </p>
              </div>
              <span className="text-ink-700">
                {formatPrice(o.total, o.currency)}
              </span>
            </li>
          ))}
          {(!orders || orders.length === 0) && (
            <li className="py-8 text-center text-sm text-ink-400">
              You do not have any order requests yet.{" "}
              <Link href="/products" className="text-gold-500 hover:underline">
                Browse the collection -&gt;
              </Link>
            </li>
          )}
        </ul>
      </section>
    </>
  );
}

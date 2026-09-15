import Link from "next/link";
import { Package } from "lucide-react";
import { createClient } from "@/lib/local-data/server";
import { getCurrentUser } from "@/lib/local-data/auth";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/local-data/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Request Received",
  contacted: "Contacted",
  confirmed: "Confirmed",
  shipped: "Shipping",
  completed: "Completed",
  cancelled: "Cancel",
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  new: "bg-emerald-50 text-emerald-700",
  contacted: "bg-blue-50 text-blue-700",
  confirmed: "bg-indigo-50 text-indigo-700",
  shipped: "bg-purple-50 text-purple-700",
  completed: "bg-ink-100 text-ink-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function MyOrdersPage() {
  const user = await getCurrentUser();
  const dataClient = await createClient();

  const { data: orders } = await dataClient
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <header>
        <h1 className="font-serif text-3xl text-ink-700">My Orders</h1>
        <p className="mt-1 text-sm text-ink-500">
          {orders?.length ?? 0} order requests
        </p>
      </header>

      {(!orders || orders.length === 0) ? (
        <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-soft">
          <Package className="mx-auto h-10 w-10 text-ink-200" strokeWidth={1.2} />
          <p className="mt-4 text-ink-500">You do not have any order requests yet.</p>
          <Link href="/products" className="btn-primary mt-6">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {(orders as Order[]).map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.id}`}
              className="block rounded-2xl bg-white p-5 shadow-soft hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-ink-400">
                    #{o.order_number}
                  </p>
                  <p className="mt-1 font-medium text-ink-700">
                    {o.items.length} products
                  </p>
                  <p className="text-xs text-ink-400">
                    {new Date(o.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-0.5 text-xs ${STATUS_COLOR[o.status]}`}
                  >
                    {STATUS_LABEL[o.status]}
                  </span>
                  <p className="mt-2 font-medium text-ink-700">
                    {formatPrice(o.total, o.currency)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

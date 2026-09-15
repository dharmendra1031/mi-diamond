import Link from "next/link";
import { createClient } from "@/lib/local-data/server";
import { formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/local-data/types";

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
  new: "bg-emerald-50 text-emerald-700",
  contacted: "bg-blue-50 text-blue-700",
  confirmed: "bg-indigo-50 text-indigo-700",
  shipped: "bg-purple-50 text-purple-700",
  completed: "bg-ink-100 text-ink-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: OrderStatus }>;
}) {
  const { status } = await searchParams;
  const dataClient = await createClient();

  let query = dataClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: orders } = await query;

  const tabs: { value?: OrderStatus; label: string }[] = [
    { value: undefined, label: "All" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancel" },
  ];

  return (
    <>
      <header>
        <h1 className="font-serif text-3xl text-ink-700">Order Requests</h1>
        <p className="mt-1 text-sm text-ink-500">
          Customer requests are listed here. You can call the customer and
          clarify payment details.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-ink-700/10 pb-4">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/orders?status=${t.value}` : "/admin/orders"}
            className={`rounded-full px-4 py-1.5 text-xs ${
              status === t.value || (!status && !t.value)
                ? "bg-ink-700 text-cream"
                : "bg-white text-ink-500 hover:text-ink-700"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-700/10 bg-cream/40 text-left">
            <tr>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">No</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">Customer</th>
              <th className="hidden md:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">Phone</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400 text-right">Amount</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">Status</th>
              <th className="hidden sm:table-cell px-4 py-3 text-xs font-medium uppercase tracking-wider text-ink-400">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-700/5">
            {(orders as Order[] | null)?.map((o) => (
              <tr key={o.id} className="hover:bg-cream/40">
                <td className="px-4 py-3 font-mono text-xs">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-ink-700 hover:text-gold-500"
                  >
                    {o.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium text-ink-700">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="hover:text-gold-500"
                  >
                    {o.customer_name}
                  </Link>
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-ink-500">
                  <a href={`tel:${o.customer_phone}`} className="hover:text-ink-700">
                    {o.customer_phone}
                  </a>
                </td>
                <td className="px-4 py-3 text-right font-medium text-ink-700">
                  {formatPrice(o.total, o.currency)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-3 py-0.5 text-xs ${STATUS_COLOR[o.status]}`}
                  >
                    {STATUS_LABEL[o.status]}
                  </span>
                </td>
                <td className="hidden sm:table-cell px-4 py-3 text-xs text-ink-400">
                  {new Date(o.created_at).toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-ink-400">
                  No order requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

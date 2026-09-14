import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/auth";
import { formatPrice, whatsappUrl } from "@/lib/format";
import type { Order, OrderItem, OrderStatus } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Request Received",
  contacted: "Contacted",
  confirmed: "Confirmed",
  shipped: "Shipping",
  completed: "Completed",
  cancelled: "Cancel",
};

const STEPS: OrderStatus[] = [
  "new",
  "contacted",
  "confirmed",
  "shipped",
  "completed",
];

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle<Order>();

  if (!order) notFound();

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <h1 className="font-serif text-3xl text-ink-700">
          Order #{order.order_number}
        </h1>
      </div>
      <p className="text-sm text-ink-400">
        {new Date(order.created_at).toLocaleString("tr-TR")}
      </p>

      {order.status !== "cancelled" && (
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-serif text-lg text-ink-700">Order Status</h2>
          <div className="mt-6 flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex items-center gap-2">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                      i <= currentStepIndex
                        ? "bg-gold-400 text-ink-700"
                        : "bg-ink-100 text-ink-400"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`mt-2 text-[10px] sm:text-xs text-center ${
                      i <= currentStepIndex
                        ? "text-ink-700 font-medium"
                        : "text-ink-400"
                    }`}
                  >
                    {STATUS_LABEL[step]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${
                      i < currentStepIndex ? "bg-gold-400" : "bg-ink-100"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {order.status === "cancelled" && (
        <div className="mt-8 rounded-2xl bg-red-50 p-6 text-red-800">
          <h2 className="font-serif text-lg">This order was cancelled</h2>
          {order.admin_note && (
            <p className="mt-2 text-sm">{order.admin_note}</p>
          )}
        </div>
      )}

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="font-serif text-lg text-ink-700">Products</h2>
        <ul className="mt-4 divide-y divide-ink-700/10">
          {(order.items as OrderItem[]).map((item) => (
            <li key={item.product_id} className="flex gap-4 py-3 items-center">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-ink-50 shrink-0">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${item.slug}`}
                  className="font-medium text-ink-700 hover:text-gold-500"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-ink-400">
                  {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <span className="text-ink-700">
                {formatPrice(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 border-t border-ink-700/10 pt-4 text-sm space-y-1">
          <div className="flex justify-between text-base font-medium">
            <dt className="text-ink-700">Total</dt>
            <dd className="text-ink-700">
              {formatPrice(order.total, order.currency)}
            </dd>
          </div>
        </dl>
      </section>

      {(order.address_line || order.city) && (
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-soft">
          <h2 className="font-serif text-lg text-ink-700">Delivery Address</h2>
          <p className="mt-3 text-sm text-ink-500">
            {[
              order.address_line,
              order.district,
              order.city,
              order.postal_code,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
        </section>
      )}

      {order.customer_note && (
        <section className="mt-6 rounded-2xl bg-cream/60 p-6 border border-ink-700/10">
          <h2 className="font-serif text-lg text-ink-700">Your Note</h2>
          <p className="mt-3 text-sm text-ink-500 whitespace-pre-line">
            {order.customer_note}
          </p>
        </section>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={whatsappUrl(`Hello, I would like information about my order #${order.order_number}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold"
        >
          WhatsApp ile Sor
        </a>
      </div>
    </>
  );
}

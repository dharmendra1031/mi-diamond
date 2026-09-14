import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, whatsappUrl } from "@/lib/format";
import type { Order, OrderItem } from "@/lib/supabase/types";
import { OrderStatusForm } from "./status-form";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle<Order>();

  if (!order) notFound();

  return (
    <>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> All Requests
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <h1 className="font-serif text-3xl text-ink-700">{order.customer_name}</h1>
        <span className="font-mono text-sm text-ink-400">#{order.order_number}</span>
      </div>
      <p className="text-xs text-ink-400">
        {new Date(order.created_at).toLocaleString("tr-TR")}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-serif text-lg text-ink-700">Contact</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-gold-500" />
                <div>
                  <dt className="text-xs text-ink-400">Phone</dt>
                  <dd>
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="text-ink-700 hover:text-gold-500"
                    >
                      {order.customer_phone}
                    </a>
                  </dd>
                </div>
              </div>
              {order.customer_email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 text-gold-500" />
                  <div>
                    <dt className="text-xs text-ink-400">Email</dt>
                    <dd>
                      <a
                        href={`mailto:${order.customer_email}`}
                        className="text-ink-700 hover:text-gold-500"
                      >
                        {order.customer_email}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {(order.address_line || order.city) && (
                <div className="flex items-start gap-2 sm:col-span-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-gold-500" />
                  <div>
                    <dt className="text-xs text-ink-400">Address</dt>
                    <dd className="text-ink-700">
                      {[
                        order.address_line,
                        order.district,
                        order.city,
                        order.postal_code,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </dd>
                  </div>
                </div>
              )}
            </dl>

            <div className="mt-4 flex gap-2">
              <a
                href={`tel:${order.customer_phone}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink-700 px-4 py-2 text-xs text-cream hover:bg-ink-600"
              >
                <Phone className="h-3.5 w-3.5" /> Call Customer
              </a>
              <a
                href={whatsappUrl(`Hello ${order.customer_name}, we are contacting you about your request ${order.order_number}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs text-white hover:bg-[#20bd5a]"
              >
                WhatsApp
              </a>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="font-serif text-lg text-ink-700">Products</h2>
            <ul className="mt-4 divide-y divide-ink-700/10">
              {(order.items as OrderItem[]).map((item) => (
                <li
                  key={item.product_id}
                  className="flex gap-4 py-3 items-center"
                >
                  <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-ink-50 shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      target="_blank"
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
              <div className="flex justify-between">
                <dt className="text-ink-500">Subtotal</dt>
                <dd className="text-ink-700">
                  {formatPrice(order.subtotal, order.currency)}
                </dd>
              </div>
              <div className="flex justify-between text-base font-medium border-t border-ink-700/10 pt-2 mt-2">
                <dt className="text-ink-700">Total</dt>
                <dd className="text-ink-700">
                  {formatPrice(order.total, order.currency)}
                </dd>
              </div>
            </dl>
          </section>

          {order.customer_note && (
            <section className="rounded-2xl bg-cream/60 p-6 border border-ink-700/10">
              <h2 className="font-serif text-lg text-ink-700">Customer Note</h2>
              <p className="mt-3 text-sm text-ink-500 whitespace-pre-line">
                {order.customer_note}
              </p>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-10 lg:h-fit">
          <OrderStatusForm
            id={order.id}
            status={order.status}
            adminNote={order.admin_note}
          />
        </aside>
      </div>
    </>
  );
}

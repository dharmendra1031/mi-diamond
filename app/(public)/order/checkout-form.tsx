"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingBag, UserCircle } from "lucide-react";
import { useCart } from "@/components/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";

type Props = {
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  loggedIn?: boolean;
  userId?: string | null;
};

export function CheckoutForm({
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
  loggedIn = false,
  userId = null,
}: Props) {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-soft">
        <ShoppingBag className="mx-auto h-10 w-10 text-ink-200" strokeWidth={1.2} />
        <p className="mt-4 text-ink-500">Add products to your cart before creating an order.</p>
        <Link href="/products" className="btn-primary mt-6">Browse Products</Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      user_id: userId,
      customer_name: String(fd.get("name") ?? "").trim(),
      customer_phone: String(fd.get("phone") ?? "").trim(),
      customer_email: String(fd.get("email") ?? "").trim() || null,
      address_line: String(fd.get("address") ?? "").trim() || null,
      city: String(fd.get("city") ?? "").trim() || null,
      district: String(fd.get("district") ?? "").trim() || null,
      postal_code: String(fd.get("postal_code") ?? "").trim() || null,
      customer_note: String(fd.get("note") ?? "").trim() || null,
      items,
      subtotal,
      total: subtotal,
      currency: "TRY",
      payment_status: "not_required" as const,
    };

    if (!payload.customer_name || !payload.customer_phone) {
      setError("Ad soyad ve telefon zorunludur.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from("orders")
        .insert(payload)
        .select("id, order_number")
        .single();

      if (dbError) throw dbError;

      clear();
      router.push(`/order/thank-you?no=${data.order_number}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "There was a problem sending your request. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        {!loggedIn && (
          <div className="rounded-2xl border border-gold-400/30 bg-gold-50/50 p-5 flex items-start gap-3">
            <UserCircle className="h-6 w-6 text-gold-500 shrink-0" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-ink-700">Have an account?</p>
              <p className="mt-1 text-ink-500">
                <Link href={`/login?next=/order`} className="text-gold-600 hover:underline font-medium">
                  Sign in
                </Link>{" "}
                — your details will be filled automatically and your order will be saved to your account
                kaydedilsin. Misafir olarak da devam edebilirsiniz.
              </p>
            </div>
          </div>
        )}

        <fieldset className="rounded-2xl bg-white p-6 shadow-soft">
          <legend className="px-2 font-serif text-lg text-ink-700">
            Contact Bilgileri
          </legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Full Name *" name="name" defaultValue={defaultName} required />
            <Field
              label="Phone *"
              name="phone"
              type="tel"
              defaultValue={defaultPhone}
              required
              placeholder="05xx xxx xx xx"
            />
            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={defaultEmail}
              className="sm:col-span-2"
            />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-6 shadow-soft">
          <legend className="px-2 font-serif text-lg text-ink-700">
            Delivery Address <span className="text-xs text-ink-400">(opsiyonel)</span>
          </legend>
          <p className="mt-1 px-2 text-xs text-ink-400">
            Leave this blank if you want to pick up from the store.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field
              label="Street Address"
              name="address"
              className="sm:col-span-2"
            />
            <Field label="City" name="city" />
            <Field label="District" name="district" />
            <Field label="Posta Kodu" name="postal_code" />
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-white p-6 shadow-soft">
          <legend className="px-2 font-serif text-lg text-ink-700">
            Your Note
          </legend>
          <textarea
            name="note"
            rows={4}
            placeholder="Ring size, special requests, preferred contact time..."
            className="mt-3 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-3 text-sm focus:border-ink-700 focus:outline-none"
          />
        </fieldset>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <aside className="sticky top-28 h-fit rounded-2xl bg-white p-6 shadow-soft">
        <h2 className="font-serif text-xl text-ink-700">Order Summary</h2>

        <ul className="mt-4 space-y-3 max-h-72 overflow-auto pr-1">
          {items.map((item) => (
            <li key={item.product_id} className="flex gap-3 text-sm">
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
                <p className="truncate font-medium text-ink-700">{item.name}</p>
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

        <dl className="mt-6 space-y-2 border-t border-ink-700/10 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Subtotal</dt>
            <dd className="text-ink-700">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between text-base font-medium border-t border-ink-700/10 pt-2 mt-2">
            <dt className="text-ink-700">Total</dt>
            <dd className="text-ink-700">{formatPrice(subtotal)}</dd>
          </div>
        </dl>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-full bg-ink-700 py-3 text-sm font-medium text-cream transition hover:bg-ink-600 disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Sending...
            </span>
          ) : (
            "Send My Order Request"
          )}
        </button>

        <p className="mt-4 text-xs text-ink-400 leading-relaxed">
          After your request is created, our team will contact you within 24 hours
          to share product and payment details.
        </p>
      </aside>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-ink-700 font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
      />
    </label>
  );
}

import Link from "next/link";
import { Check } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/format";

export const metadata = { title: "Request Received" };

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ no?: string }>;
}) {
  const { no } = await searchParams;

  return (
    <div className="container-prose py-20 md:py-28 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
        <Check className="h-8 w-8 text-emerald-600" strokeWidth={1.5} />
      </div>
      <h1 className="mt-6 font-serif text-4xl md:text-5xl text-ink-700">
        Request Received
      </h1>
      <p className="mt-4 mx-auto max-w-xl text-ink-500">
        Your order request has been sent successfully. Our team will contact you as soon as possible
        to share product details and payment options.
      </p>

      {no && (
        <div className="mt-8 inline-block rounded-full bg-white px-6 py-3 shadow-soft">
          <span className="text-xs uppercase tracking-[0.2em] text-ink-400">
            Order No
          </span>
          <span className="ml-3 font-mono text-ink-700">{no}</span>
        </div>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/products" className="btn-primary">
          Continue Shopping
        </Link>
        <a
          href={whatsappUrl(`Hello, I would like information about my request ${no}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold"
        >
          WhatsApp ile Yaz
        </a>
      </div>

      <p className="mt-12 text-xs text-ink-400">
        For urgent matters, call us at {siteConfig.phone}.
      </p>
    </div>
  );
}

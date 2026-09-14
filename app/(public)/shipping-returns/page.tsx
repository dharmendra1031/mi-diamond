import { Truck, RotateCcw, Shield, Clock } from "lucide-react";

export const metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  return (
    <section className="container-prose py-16 md:py-24">
      <p className="label-eyebrow">Shipping & Returns</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl text-ink-700">
        Shipping & Returns Policy
      </h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        All products are carefully delivered to your door with insured shipping.
        You can find our shipping and return process below.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Block
          icon={Truck}
          title="Fast Shipping"
          text="In-stock products are shipped with insurance within 1-3 business days after payment confirmation."
        />
        <Block
          icon={Shield}
          title="Secure Packaging"
          text="All products are shipped in special boxes with protective packaging. Gift wrapping is complimentary."
        />
        <Block
          icon={Clock}
          title="Custom Orders"
          text="Personalized and made-to-order products are prepared within 7-14 business days."
        />
        <Block
          icon={RotateCcw}
          title="Exchange Within 14 Days"
          text="Standard products can be exchanged within 14 days of delivery with an invoice."
        />
      </div>

      <article className="prose prose-ink mt-16 max-w-3xl space-y-6 text-ink-500 leading-relaxed">
        <h2 className="font-serif text-2xl text-ink-700">Details</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>
            We ship across Turkey through contracted shipping partners.
          </li>
          <li>
            Shipping is free on all order requests over 500 TL.
          </li>
          <li>
            Personalized products (custom sizing, engraving, or custom design) are not eligible
            for return.
          </li>
          <li>
            Return requests require the product to be in its original box, undamaged, and sent
            with its invoice.
          </li>
          <li>
            Refunds are issued within 7 business days after return approval.
          </li>
        </ul>
      </article>
    </section>
  );
}

function Block({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Truck;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <Icon className="h-7 w-7 text-gold-500" strokeWidth={1.4} />
      <h3 className="mt-4 font-serif text-xl text-ink-700">{title}</h3>
      <p className="mt-2 text-sm text-ink-500 leading-relaxed">{text}</p>
    </div>
  );
}

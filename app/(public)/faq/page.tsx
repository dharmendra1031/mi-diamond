import { siteConfig, whatsappUrl } from "@/lib/format";

export const metadata = { title: "Frequently Asked Questions" };

const FAQS = [
  {
    q: "Are your diamonds certified?",
    a: "Yes, all diamond products in our collection are delivered with internationally recognized certificates. Carat, color, clarity, and cut details are included.",
  },
  {
    q: "How do I determine ring size?",
    a: "We offer professional sizing in store. If you order online, you can measure the inner diameter of an existing ring or ask us for a size guide on WhatsApp.",
  },
  {
    q: "How does the order process work?",
    a: "After building your cart, complete the order request form. Our team will contact you within 24 hours to confirm product, sizing, and payment details.",
  },
  {
    q: "How can I pay?",
    a: "We do not accept online payment right now. After order confirmation, you can pay by bank transfer, payment link, or cash/card at store pickup.",
  },
  {
    q: "How long does shipping take?",
    a: "In-stock products ship within 1-3 business days after payment confirmation. Made-to-order designs may take 7-14 business days.",
  },
  {
    q: "Are returns or exchanges possible?",
    a: "Personalized products cannot be returned for hygiene and value-protection reasons. Standard products can be exchanged within 14 days with an invoice.",
  },
  {
    q: "Can I request a custom design?",
    a: "Absolutely. Share the design you have in mind and our team will prepare design suggestions and a quote. We can start quickly on WhatsApp.",
  },
];

export default function FaqPage() {
  return (
    <section className="container-prose py-16 md:py-24">
      <p className="label-eyebrow">Help</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl text-ink-700">
        Frequently Asked Questions
      </h1>
      <p className="mt-3 max-w-2xl text-ink-500">
        We hope the answers below are helpful. If there is
        anything else on your mind, you can always reach us.
      </p>

      <div className="mt-12 max-w-3xl space-y-4">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl bg-white p-6 shadow-soft"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
              <h2 className="font-serif text-lg text-ink-700">{f.q}</h2>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream text-gold-500 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 text-sm text-ink-500 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-16 rounded-3xl bg-ink-700 p-10 text-center text-cream">
        <h2 className="font-serif text-2xl">Didn't find the answer you need?</h2>
        <p className="mt-2 text-cream/70">
          Call us at {siteConfig.phone} or message us on WhatsApp.
        </p>
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold mt-6"
        >
          Contact on WhatsApp
        </a>
      </div>
    </section>
  );
}

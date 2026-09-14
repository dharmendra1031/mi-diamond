import { siteConfig } from "@/lib/format";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="container-prose py-16 md:py-24">
      <p className="label-eyebrow">Yasal</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl text-ink-700">
        Privacy Policy
      </h1>

      <article className="prose prose-ink mt-10 max-w-3xl space-y-5 text-ink-500 leading-relaxed text-sm">
        <p>
          At {siteConfig.name}, we care deeply about our customers' privacy.
          This policy explains how information collected when you visit
          our site is used.
        </p>

        <h2 className="font-serif text-xl text-ink-700">Toplanan Bilgiler</h2>
        <p>
          The name, phone, email, and address details you share in the order request form
          are used only to contact you and process your request.
          They are not shared with third parties.
        </p>

        <h2 className="font-serif text-xl text-ink-700">Cookies</h2>
        <p>
          Cart and wishlist data are stored in your browser's local
          storage. This data does not leave your browser and is not
          sent to our servers.
        </p>

        <h2 className="font-serif text-xl text-ink-700">Contact</h2>
        <p>
          If you want your data deleted or updated, you can contact us at{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-gold-500 hover:underline"
          >
            {siteConfig.email}
          </a>{" "}
          .
        </p>
      </article>
    </section>
  );
}

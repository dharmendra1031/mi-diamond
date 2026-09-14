import { siteConfig, whatsappUrl } from "@/lib/format";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="container-prose py-16 md:py-24">
      <p className="label-eyebrow">Privacy</p>
      <h1 className="mt-3 font-serif text-4xl text-ink-700 md:text-5xl">
        Privacy Policy
      </h1>

      <article className="mt-10 max-w-3xl space-y-7 text-sm leading-relaxed text-ink-500">
        <p>
          {siteConfig.name} uses this website as a catalogue to present jewellery
          collections and store contact information. The website does not provide
          online checkout or online payment.
        </p>

        <div>
          <h2 className="font-serif text-xl text-ink-700">Information you choose to share</h2>
          <p className="mt-2">
            If you contact Michael Jewellery by phone, WhatsApp, or Instagram, the
            information you send is handled through the service you chose to use and
            is used to respond to your enquiry.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-ink-700">Website catalogue</h2>
          <p className="mt-2">
            Product images, descriptions, categories, availability, and prices shown
            on this site are catalogue information. For current availability or
            product details, please contact the store directly.
          </p>
        </div>

        <div>
          <h2 className="font-serif text-xl text-ink-700">Contact</h2>
          <p className="mt-2">
            For privacy-related questions, call {siteConfig.phone} or contact us on{" "}
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-500 hover:underline"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      </article>
    </section>
  );
}

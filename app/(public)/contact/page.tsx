import {
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Store,
} from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/format";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="container-prose py-16 md:py-24">
      <p className="label-eyebrow">Michael Jewellery Kuwait</p>
      <h1 className="mt-3 font-serif text-4xl text-ink-700 md:text-5xl">
        Visit our showroom
      </h1>
      <p className="mt-4 max-w-2xl text-ink-500">
        Explore our jewellery collection in Hawalli or contact us directly for product details and availability.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ContactCard icon={Phone} title="Landline">
          <a
            href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
            className="text-ink-500 transition hover:text-gold-600"
          >
            {siteConfig.phone}
          </a>
        </ContactCard>

        <ContactCard icon={MessageCircle} title="Mobile & WhatsApp">
          <a
            href={whatsappUrl("Hello Michael Jewellery, I would like to enquire about your collection.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-500 transition hover:text-gold-600"
          >
            {siteConfig.mobile}
          </a>
        </ContactCard>

        <ContactCard icon={Instagram} title="Instagram">
          <a
            href={`https://instagram.com/${siteConfig.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-ink-500 transition hover:text-gold-600"
          >
            @{siteConfig.instagram}
          </a>
        </ContactCard>

        <div className="rounded-2xl bg-white p-6 shadow-soft md:col-span-2">
          <MapPin className="h-6 w-6 text-gold-500" strokeWidth={1.4} />
          <h2 className="mt-4 font-serif text-xl text-ink-700">Showroom Address</h2>
          <p className="mt-2 max-w-xl leading-7 text-ink-500">{siteConfig.address}</p>
        </div>

        {siteConfig.email ? (
          <ContactCard icon={Mail} title="Email">
            <a
              href={`mailto:${siteConfig.email}`}
              className="break-all text-ink-500 transition hover:text-gold-600"
            >
              {siteConfig.email}
            </a>
          </ContactCard>
        ) : (
          <div
            className="rounded-2xl p-6 text-white shadow-soft"
            style={{ background: "linear-gradient(135deg,#180c10 0%,#3a1020 100%)" }}
          >
            <Store className="h-6 w-6 text-[#e8c768]" strokeWidth={1.4} />
            <h2 className="mt-4 font-serif text-xl">In-store consultation</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Visit Shop 3 at Al-Haddad Complex to view the collection in person.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Phone;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-soft">
      <Icon className="h-6 w-6 text-gold-500" strokeWidth={1.4} />
      <h2 className="mt-4 font-serif text-xl text-ink-700">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

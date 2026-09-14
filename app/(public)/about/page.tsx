import Image from "next/image";
import { Diamond, Gem, MapPin, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/format";
import { getSiteAssetMap } from "@/lib/site-assets";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const assets = await getSiteAssetMap(["about_image"]);
  const aboutImage = assets.about_image;

  return (
    <>
      <section className="container-prose py-16 md:py-24">
        <p className="label-eyebrow">Michael Jewellery Kuwait</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl text-ink-700 md:text-5xl">
          Fine jewellery presented with a personal showroom experience.
        </h1>

        <div className="mt-10 grid items-start gap-12 md:grid-cols-2 md:gap-20">
          <div className="space-y-5 leading-relaxed text-ink-500">
            <p>
              {siteConfig.name} is a jewellery showroom in Hawalli, Kuwait, offering a curated selection of gold and diamond jewellery.
            </p>
            <p>
              The collection includes statement sets, necklaces, rings, bracelets and other pieces for celebrations, gifting and everyday elegance.
            </p>
            <p>
              Customers can browse the collection online and contact the showroom directly for product details, availability and personal assistance.
            </p>

            <div className="mt-8 rounded-2xl border border-gold-400/20 bg-gold-50/40 p-5">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold-600" />
                <div>
                  <p className="text-sm font-semibold text-ink-700">Visit Michael Jewellery</p>
                  <p className="mt-1 text-sm leading-6 text-ink-500">{siteConfig.address}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-700 shadow-premium">
            {aboutImage ? (
              <Image
                src={aboutImage}
                alt="Michael Jewellery collection"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_70%_25%,#5f2032_0%,#2d1019_35%,#120a0c_78%)] font-serif text-5xl text-gold-200/80">
                MJ
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <p className="font-serif text-2xl">{siteConfig.name}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-200">
                Hawalli · Kuwait
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-700/10 bg-white">
        <div className="container-prose py-16 md:py-20">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Diamond,
                title: "Curated Collection",
                text: "Browse jewellery designs selected for different styles and occasions.",
              },
              {
                icon: Gem,
                title: "Product Details",
                text: "View product photos, descriptions, pricing and availability online.",
              },
              {
                icon: MessageCircle,
                title: "Direct Assistance",
                text: "Contact the showroom by phone or WhatsApp for more information.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold-50">
                  <item.icon className="h-6 w-6 text-gold-500" strokeWidth={1.4} />
                </div>
                <h2 className="mt-5 font-serif text-xl text-ink-700">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

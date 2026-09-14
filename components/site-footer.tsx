import Image from "next/image";
import Link from "next/link";
import {
  Instagram,
  Phone,
  Mail,
  MapPin,
  LayoutGrid,
  MessageCircle,
} from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/format";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { getSiteAssetMap } from "@/lib/site-assets";

export async function SiteFooter() {
  let isAdmin = false;
  try {
    const { profile } = await getCurrentProfile();
    isAdmin = profile?.is_admin ?? false;
  } catch {
    // Render an anonymous footer when Supabase env vars are missing.
  }

  const assets = await getSiteAssetMap(["logo"]);
  const logoSrc = assets.logo;

  return (
    <footer
      className="mt-28 border-t border-[#d7a52d]/25 text-white"
      style={{ background: "linear-gradient(135deg,#100b0c 0%,#2d0d18 52%,#120c0d 100%)" }}
    >
      <div className="container-prose py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_.65fr_.9fr]">
          <div>
            <div className="flex items-center gap-4">
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white font-serif text-sm text-ink-700 ring-1 ring-[#d7a52d]/60">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt="Michael Jewellery logo"
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                ) : (
                  <span>MJ</span>
                )}
              </span>
              <div>
                <span className="block font-serif text-2xl tracking-[0.06em]">
                  {siteConfig.name}
                </span>
                <span className="mt-1 block text-[9px] uppercase tracking-[0.32em] text-[#e8c768]/75">
                  Fine Jewellery - Kuwait
                </span>
              </div>
            </div>
            <p className="mt-6 max-w-lg font-serif text-2xl leading-relaxed text-white md:text-3xl">
              Refined gold and diamond jewellery for memorable moments.
            </p>
            <a
              href={whatsappUrl("Hello Michael Jewellery, I would like to enquire about your collection.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 border-b border-[#d7a52d] pb-1 text-xs uppercase tracking-[0.18em] text-[#f0d77c] transition hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Enquire on WhatsApp
            </a>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#e8c768]">
              Explore
            </p>
            <ul className="mt-5 space-y-3 text-sm font-medium text-white/80">
              <li><Link href="/products" className="transition hover:text-white">Collection</Link></li>
              <li><Link href="/about" className="transition hover:text-white">About</Link></li>
              <li><Link href="/contact" className="transition hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#e8c768]">
              Visit & Contact
            </p>
            <ul className="mt-5 space-y-4 text-sm font-medium text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#e8c768]" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#e8c768]" />
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="transition hover:text-white">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-[#e8c768]" />
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                  {siteConfig.mobile}
                </a>
              </li>
              {siteConfig.email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#e8c768]" />
                  <a href={`mailto:${siteConfig.email}`} className="transition hover:text-white">
                    {siteConfig.email}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-3">
                <Instagram className="h-4 w-4 text-[#e8c768]" />
                <a
                  href={`https://instagram.com/${siteConfig.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-white"
                >
                  @{siteConfig.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55 md:flex-row md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[#e8c768] transition hover:text-white"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Admin Panel
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}

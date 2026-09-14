import Link from "next/link";
import {
  Diamond,
  Instagram,
  Phone,
  Mail,
  MapPin,
  LayoutGrid,
  MessageCircle,
} from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/format";
import { getCurrentProfile } from "@/lib/supabase/auth";

export async function SiteFooter() {
  let isAdmin = false;
  try {
    const { profile } = await getCurrentProfile();
    isAdmin = profile?.is_admin ?? false;
  } catch {
    // Render an anonymous footer when Supabase env vars are missing.
  }

  return (
    <footer className="mt-28 border-t border-gold-400/20 bg-gradient-to-br from-ink-700 via-ink-600 to-silver-800 text-cream">
      <div className="container-prose py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_.65fr_.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/50">
                <Diamond className="h-4 w-4 text-gold-400" strokeWidth={1.25} />
              </span>
              <div>
                <span className="block font-serif text-2xl tracking-[0.08em]">
                  {siteConfig.name}
                </span>
                <span className="mt-1 block text-[9px] uppercase tracking-[0.32em] text-cream/45">
                  Fine Jewellery
                </span>
              </div>
            </div>
            <p className="mt-6 max-w-lg font-serif text-2xl leading-relaxed text-white md:text-3xl">
              We turn special moments into timeless jewelry to be passed down for generations.
            </p>
            <a
              href={whatsappUrl("Hello, I would like to get information about your collection.")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 border-b border-gold-400 pb-1 text-xs uppercase tracking-[0.18em] text-gold-300 transition hover:text-gold-200"
            >
              <MessageCircle className="h-4 w-4" />
              Speak with a personal consultant
            </a>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold-400">
              Explore
            </p>
            <ul className="mt-5 space-y-3 text-sm font-medium text-cream/88">
              <li><Link href="/products" className="transition hover:text-cream">Collection</Link></li>
              <li><Link href="/about" className="transition hover:text-cream">About</Link></li>
              <li><Link href="/contact" className="transition hover:text-cream">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold-400">
              Contact
            </p>
            <ul className="mt-5 space-y-4 text-sm font-medium text-cream/88">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold-400" />
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="transition hover:text-cream">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold-400" />
                <a href={`mailto:${siteConfig.email}`} className="transition hover:text-cream">
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="h-4 w-4 text-gold-400" />
                <a
                  href={`https://instagram.com/${siteConfig.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-cream"
                >
                  @{siteConfig.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-cream/15 pt-7 text-[10px] font-semibold uppercase tracking-[0.14em] text-cream/70 md:flex-row md:items-center md:justify-between">
          <span>(c) {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</span>
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-gold-400 transition hover:text-gold-300"
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

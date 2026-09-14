import Link from "next/link";
import { Diamond, MessageCircle } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/format";
import { HeaderNav } from "./header-nav";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collection" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-gold-400/20 text-cream shadow-soft"
      style={{ backgroundColor: "#0b1a2f" }}
    >
      <div
        className="overflow-hidden border-b border-white/10 px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.08em] text-gold-100 sm:text-[10px] sm:tracking-[0.2em]"
        style={{ backgroundColor: "#152544", color: "#f4e8c2" }}
      >
        <span className="sm:hidden">Timeless Jewellery / Personal Consultation</span>
        <span className="hidden sm:inline">Timeless designs / Refined craft / Personal consultation</span>
      </div>

      <div className="container-prose flex h-[72px] items-center justify-between gap-4 sm:h-[76px]">
        <Link href="/" className="group flex shrink-0 items-center gap-3 text-cream">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/50 bg-gold-400/10 transition group-hover:border-gold-300 group-hover:bg-gold-400/20">
            <Diamond className="h-4 w-4 text-gold-400" strokeWidth={1.25} />
          </span>
          <span>
            <span className="block font-serif text-[20px] leading-none tracking-[0.06em] text-white sm:text-[23px]">
              {siteConfig.name}
            </span>
            <span className="mt-1 block text-[8px] font-semibold uppercase tracking-[0.24em] text-gold-100/80 sm:tracking-[0.34em]">
              Fine Jewellery
            </span>
          </span>
        </Link>

        <HeaderNav nav={nav} />

        <a
          href={whatsappUrl("Hello, I would like to get information about your collection.")}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-full border border-gold-400/35 bg-gold-400/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-100 transition hover:border-gold-300 hover:bg-gold-400 hover:text-ink-900 md:inline-flex"
        >
          <MessageCircle className="h-4 w-4" />
          Consultation
        </a>
      </div>
    </header>
  );
}

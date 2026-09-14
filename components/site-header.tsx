import Link from "next/link";
import { Diamond, MessageCircle, Star } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/format";
import { HeaderNav } from "./header-nav";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collection" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function BrandMark() {
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d7a52d]/70 bg-black/25 shadow-[0_0_24px_rgba(215,165,45,.12)]">
      <Star
        className="absolute top-1.5 h-2.5 w-2.5 fill-[#e7b838] text-[#e7b838]"
        strokeWidth={1}
      />
      <Diamond className="mt-2 h-5 w-5 text-[#e7b838]" strokeWidth={1.2} />
    </span>
  );
}

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 border-b border-[#d7a52d]/20 text-white shadow-soft"
      style={{ background: "linear-gradient(90deg,#100b0c 0%,#240d14 52%,#100b0c 100%)" }}
    >
      <div
        className="overflow-hidden border-b border-white/10 px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.24em]"
        style={{ color: "#e8c768" }}
      >
        <span className="sm:hidden">Fine Jewellery · Hawalli, Kuwait</span>
        <span className="hidden sm:inline">Michael Jewellery · Fine Gold & Diamond Jewellery · Hawalli, Kuwait</span>
      </div>

      <div className="container-prose flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3 text-white">
          <BrandMark />
          <span>
            <span className="block font-serif text-[21px] leading-none tracking-[0.045em] text-white sm:text-[24px]">
              {siteConfig.name}
            </span>
            <span className="mt-1.5 block text-[8px] font-semibold uppercase tracking-[0.28em] text-[#e8c768]/90 sm:tracking-[0.36em]">
              Jewellery · Kuwait
            </span>
          </span>
        </Link>

        <HeaderNav nav={nav} />

        <a
          href={whatsappUrl("Hello Michael Jewellery, I would like to enquire about your collection.")}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-full border border-[#d7a52d]/45 bg-[#d7a52d]/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f0d77c] transition hover:bg-[#d7a52d] hover:text-[#160e0e] md:inline-flex"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/format";
import { getSiteAssetMap } from "@/lib/site-assets";
import { HeaderNav } from "./header-nav";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Collection" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const assets = await getSiteAssetMap(["logo"]);
  const logoSrc = assets.logo;

  return (
    <header
      className="sticky top-0 z-40 border-b border-[#d7a52d]/20 text-white shadow-soft"
      style={{ background: "linear-gradient(90deg,#100b0c 0%,#240d14 52%,#100b0c 100%)" }}
    >
      <div
        className="overflow-hidden border-b border-white/10 px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.24em]"
        style={{ color: "#e8c768" }}
      >
        <span className="sm:hidden">Fine Jewellery - Hawalli, Kuwait</span>
        <span className="hidden sm:inline">Michael Jewellery - Fine Gold & Diamond Jewellery - Hawalli, Kuwait</span>
      </div>

      <div className="container-prose flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3 text-white">
          <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white font-serif text-sm text-ink-700 shadow-[0_0_26px_rgba(215,165,45,.18)] ring-1 ring-[#d7a52d]/60">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt="Michael Jewellery logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            ) : (
              <span>MJ</span>
            )}
          </span>
          <span>
            <span className="block font-serif text-[21px] leading-none tracking-[0.045em] text-white sm:text-[24px]">
              {siteConfig.name}
            </span>
            <span className="mt-1.5 block text-[8px] font-semibold uppercase tracking-[0.28em] text-[#e8c768]/90 sm:tracking-[0.36em]">
              Jewellery - Kuwait
            </span>
          </span>
        </Link>

        <HeaderNav nav={nav} />

        <div className="hidden items-center gap-2 md:flex">
          <a
            href={whatsappUrl("Hello Michael Jewellery, I would like to enquire about your collection.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-[#d7a52d]/45 bg-[#d7a52d]/10 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f0d77c] transition hover:bg-[#d7a52d] hover:text-[#160e0e]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}

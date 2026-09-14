import Link from "next/link";
import { Diamond, MessageCircle } from "lucide-react";
import { siteConfig, whatsappUrl } from "@/lib/format";
import { HeaderNav } from "./header-nav";

const nav = [
  { href: "/", label: "Anasayfa" },
  { href: "/urunler", label: "Koleksiyon" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/10 bg-cream/95 backdrop-blur-xl">
      <div className="border-b border-cream/10 bg-ink-900 px-4 py-2 text-center text-[10px] font-medium uppercase tracking-[0.24em] text-cream/80">
        Zamansız tasarımlar · Seçkin işçilik · Kişiye özel danışmanlık
      </div>

      <div className="container-prose flex h-[76px] items-center justify-between gap-4">
        <Link href="/" className="group flex shrink-0 items-center gap-3 text-ink-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-400/50 transition group-hover:border-gold-400">
            <Diamond className="h-4 w-4 text-gold-400" strokeWidth={1.25} />
          </span>
          <span>
            <span className="block font-serif text-[23px] leading-none tracking-[0.08em]">
              {siteConfig.name}
            </span>
            <span className="mt-1 block text-[8px] uppercase tracking-[0.34em] text-ink-400">
              Fine Jewellery
            </span>
          </span>
        </Link>

        <HeaderNav nav={nav} />

        <a
          href={whatsappUrl("Merhaba, koleksiyonunuz hakkında bilgi almak istiyorum.")}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 border border-ink-700/20 px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink-700 transition hover:border-ink-700 hover:bg-ink-700 hover:text-cream md:inline-flex"
        >
          <MessageCircle className="h-4 w-4" />
          Danışmanlık
        </a>
      </div>
    </header>
  );
}

import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import {
  LayoutGrid,
  Package,
  Tags,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/format";
import { signOutAction } from "./actions";

export const metadata = { title: "Admin" };

const logoSrc = "/michael-jewellery/michael-jewellery-logo.webp";

function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <span
      className="relative shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-gold-400/50"
      style={{ width: size, height: size }}
    >
      <Image src={logoSrc} alt="Michael Jewellery logo" fill sizes={`${size}px`} className="object-contain" />
    </span>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const isLogin = pathname.startsWith("/admin/login");

  if (isLogin) {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutGrid },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Tags },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-ink-700/10 bg-white md:flex">
          <div className="border-b border-ink-700/10 p-6">
            <Link href="/admin" className="flex items-center gap-3 text-ink-700">
              <BrandLogo />
              <span>
                <span className="block font-serif text-lg leading-none">{siteConfig.name}</span>
                <span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-ink-400">
                  Catalogue Admin
                </span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-500 transition hover:bg-cream hover:text-ink-700"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="space-y-2 border-t border-ink-700/10 p-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-ink-400 hover:text-ink-700"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View website
            </Link>
            {user && (
              <div className="px-3 py-2">
                <p className="text-xs text-ink-400">Signed in as</p>
                <p className="truncate text-sm text-ink-700">{user.email}</p>
              </div>
            )}
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-cream hover:text-ink-700"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex-1 overflow-x-hidden">
          <header className="flex items-center justify-between border-b border-ink-700/10 bg-white px-4 py-3 md:hidden">
            <Link href="/admin" className="flex items-center gap-2 text-ink-700">
              <BrandLogo size={36} />
              <span className="font-serif text-base">{siteConfig.name}</span>
            </Link>
            <form action={signOutAction}>
              <button type="submit" className="text-ink-500" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </header>

          <nav className="flex border-b border-ink-700/10 bg-white text-xs md:hidden">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 px-3 py-3 text-center text-ink-500"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <main className="px-4 py-8 md:px-10 md:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

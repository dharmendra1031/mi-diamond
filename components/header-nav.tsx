"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search } from "lucide-react";

type NavItem = { href: string; label: string };

export function HeaderNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery("");
  }

  return (
    <>
      <nav className="hidden md:flex items-center gap-6 lg:gap-8">
        {nav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm tracking-wide transition ${
                active
                  ? "font-semibold text-gold-100"
                  : "font-medium text-cream/85 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form
        onSubmit={onSubmit}
        className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-auto"
      >
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-300/80" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-full border border-white/20 bg-white/12 py-2.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-cream/65 transition focus:border-gold-300/80 focus:bg-white/18 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
          />
        </div>
      </form>

      <button
        className="ml-1 text-cream md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-t border-white/10 bg-ink-700/96 shadow-soft backdrop-blur-xl md:hidden">
          <div className="container-prose py-3">
            <form onSubmit={onSubmit} className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-300/80" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-white/20 bg-white/12 py-2.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-cream/65 focus:border-gold-300 focus:outline-none"
              />
            </form>

            <nav className="mt-3 flex flex-col">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-white/10 py-3 text-base font-medium text-cream last:border-0 hover:text-gold-100"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

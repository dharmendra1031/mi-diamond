"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { User, LogIn, ShoppingBag, LogOut, UserCircle, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  loggedIn: boolean;
  fullName: string | null;
  email: string | null;
  isAdmin: boolean;
};

export function UserMenu({ loggedIn, fullName, email, isAdmin }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function onSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!loggedIn) {
    return (
      <Link
        href="/login"
        className="flex h-10 w-10 items-center justify-center text-ink-700 hover:text-gold-500 transition"
        aria-label="Sign In"
      >
        <User className="h-5 w-5" />
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center text-ink-700 hover:text-gold-500 transition"
        aria-label="My Account"
        aria-expanded={open}
      >
        <UserCircle className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-lg border border-ink-700/5 py-2 z-50">
          <div className="px-4 py-3 border-b border-ink-700/5">
            <p className="font-medium text-sm text-ink-700 truncate">
              {fullName || "Welcome"}
            </p>
            <p className="text-xs text-ink-400 truncate">{email}</p>
          </div>

          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-cream"
          >
            <UserCircle className="h-4 w-4 text-ink-400" />
            My Account
          </Link>
          <Link
            href="/account/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 hover:bg-cream"
          >
            <ShoppingBag className="h-4 w-4 text-ink-400" />
            My Orders
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gold-600 hover:bg-cream"
            >
              <Settings className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-ink-500 hover:bg-cream border-t border-ink-700/5 mt-1"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

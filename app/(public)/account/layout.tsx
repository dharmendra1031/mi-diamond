import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutGrid,
  ShoppingBag,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/auth";
import { signOutAction } from "./actions";

export const metadata = { title: "My Account" };

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getCurrentProfile();
  if (!user) redirect("/login?next=/account");

  const isAdmin = profile?.is_admin ?? false;

  return (
    <div className="container-prose py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-400">
              Member
            </p>
            <p className="mt-1 font-serif text-lg text-ink-700 truncate">
              {profile?.full_name || user.email}
            </p>
            <p className="text-xs text-ink-400 truncate">{user.email}</p>
          </div>

          <nav className="mt-3 rounded-2xl bg-white p-2 shadow-soft">
            {[
              { href: "/account", label: "Dashboard", icon: LayoutGrid },
              { href: "/account/orders", label: "My Orders", icon: ShoppingBag },
              { href: "/account/details", label: "My Details", icon: User },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-500 transition hover:bg-cream hover:text-ink-700"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gold-600 transition hover:bg-gold-50 mt-1 border-t border-ink-700/5 pt-3"
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </Link>
            )}

            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-500 transition hover:bg-cream hover:text-ink-700 mt-1 border-t border-ink-700/5 pt-3"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}

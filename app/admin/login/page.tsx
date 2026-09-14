import Link from "next/link";
import { Diamond } from "lucide-react";
import { LoginForm } from "./login-form";
import { siteConfig } from "@/lib/format";

export const metadata = { title: "Admin Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-cream">
      <Link href="/" className="flex items-center gap-2 text-ink-700">
        <Diamond className="h-6 w-6 text-gold-400" strokeWidth={1.5} />
        <span className="font-serif text-2xl">{siteConfig.name}</span>
      </Link>

      <div className="mt-10 w-full max-w-md rounded-2xl bg-white p-8 shadow-soft">
        <h1 className="font-serif text-2xl text-ink-700">Admin Sign In</h1>
        <p className="mt-1 text-sm text-ink-500">
          Sign in to manage your products.
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <LoginForm next={next} />
      </div>

      <Link
        href="/"
        className="mt-6 text-xs text-ink-400 hover:text-ink-700"
      >
        ← Back to site
      </Link>
    </div>
  );
}

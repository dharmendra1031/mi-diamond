import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { siteConfig } from "@/lib/format";

export const metadata = { title: "Admin Sign In" };

const logoSrc = "/michael-jewellery/michael-jewellery-logo.webp";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-16">
      <Link href="/" className="flex flex-col items-center gap-3 text-ink-700">
        <span className="relative h-20 w-20 overflow-hidden rounded-full bg-white shadow-soft ring-1 ring-gold-400/50">
          <Image src={logoSrc} alt="Michael Jewellery logo" fill sizes="80px" className="object-contain" priority />
        </span>
        <span className="font-serif text-2xl">{siteConfig.name}</span>
      </Link>

      <div className="mt-8 w-full max-w-md rounded-2xl bg-white p-8 shadow-soft">
        <h1 className="font-serif text-2xl text-ink-700">Admin Sign In</h1>
        <p className="mt-1 text-sm text-ink-500">
          Sign in to manage the jewellery catalogue.
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <LoginForm next={next} />
      </div>

      <Link href="/" className="mt-6 text-xs text-ink-400 hover:text-ink-700">
        ← Back to website
      </Link>
    </div>
  );
}

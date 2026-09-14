import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign In" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  const { next } = await searchParams;

  return (
    <div className="container-prose py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <p className="label-eyebrow text-center">Customer Sign In</p>
        <h1 className="mt-2 text-center font-serif text-4xl text-ink-700">
          Welcome back
        </h1>
        <p className="mt-3 text-center text-sm text-ink-500">
          Sign in to your account and track your orders.
        </p>

        <div className="mt-10 rounded-2xl bg-white p-8 shadow-soft">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account yet?{" "}
          <Link href="/register" className="font-medium text-gold-500 hover:underline">
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}

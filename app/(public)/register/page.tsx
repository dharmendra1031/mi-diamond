import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";
import { RegisterForm } from "./register-form";

export const metadata = { title: "Create Account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <div className="container-prose py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <p className="label-eyebrow text-center">New Memberlik</p>
        <h1 className="mt-2 text-center font-serif text-4xl text-ink-700">
          Create Account
        </h1>
        <p className="mt-3 text-center text-sm text-ink-500">
          For order tracking, wishlist, and faster checkout.
        </p>

        <div className="mt-10 rounded-2xl bg-white p-8 shadow-soft">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gold-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

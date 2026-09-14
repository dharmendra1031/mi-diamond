import Link from "next/link";
import { ForgotForm } from "./forgot-form";

export const metadata = { title: "Passwordmi Unuttum" };

export default function ForgotPasswordPage() {
  return (
    <div className="container-prose py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <p className="label-eyebrow text-center">Password Reset</p>
        <h1 className="mt-2 text-center font-serif text-4xl text-ink-700">
          Forgot your password?
        </h1>
        <p className="mt-3 text-center text-sm text-ink-500">
          We will send a reset link to your email.
        </p>

        <div className="mt-10 rounded-2xl bg-white p-8 shadow-soft">
          <ForgotForm />
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-gold-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const full_name = String(fd.get("full_name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, phone },
      },
    });

    if (authError) {
      setError(
        authError.message.includes("already registered")
          ? "An account already exists with this email. Please sign in."
          : authError.message,
      );
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      // If email confirmation is enabled
      setNeedsConfirm(true);
      setLoading(false);
      return;
    }

    router.replace("/account");
    router.refresh();
  }

  if (needsConfirm) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <Check className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="mt-4 font-serif text-xl text-ink-700">
          Verify your email
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          We sent you a verification link. After clicking the link,
          you can sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Full Name" name="full_name" required autoComplete="name" />
      <Field
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
      />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="05xx xxx xx xx"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        minLength={6}
        hint="En az 6 karakter."
      />

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-ink-700 py-3 text-sm font-medium text-cream transition hover:bg-ink-600 disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Creating...
          </span>
        ) : (
          "Create My Account"
        )}
      </button>

      <p className="text-center text-xs text-ink-400">
        By creating an account, you agree to our{" "}
        <a href="/privacy" className="hover:text-ink-700 underline">
          privacy policy
        </a>{" "}
        kabul ediyorsunuz.
      </p>
    </form>
  );
}

function Field({
  label,
  hint,
  ...rest
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="text-ink-700 font-medium">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
      />
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

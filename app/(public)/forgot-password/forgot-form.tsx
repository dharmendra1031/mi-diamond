"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ForgotForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/reset-password` },
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
          <Mail className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="mt-4 font-serif text-xl text-ink-700">
          Email sent
        </h2>
        <p className="mt-2 text-sm text-ink-500">
          Check your inbox. The reset link is valid for 1 hour.
          valid.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-ink-700 font-medium">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
        />
      </label>

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
            <Loader2 className="h-4 w-4 animate-spin" /> Sending...
          </span>
        ) : (
          "Send Reset Link"
        )}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/local-data/client";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const dataClient = createClient();
      const { error: dbError } = await dataClient
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase(), source: "footer" });
      if (dbError && !dbError.message.includes("duplicate")) {
        throw dbError;
      }
      setStatus("ok");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Something went wrong, please try again.",
      );
    }
  }

  if (status === "ok") {
    return (
      <div className="rounded-full bg-gold-400/10 border border-gold-400/30 px-4 py-2.5 text-sm text-gold-200 inline-flex items-center gap-2">
        <Check className="h-4 w-4" /> Welcome aboard!
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="flex-1 rounded-full border border-cream/20 bg-cream/5 px-5 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold-400 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-gold-400 px-5 py-2.5 text-sm font-medium text-ink-700 hover:bg-gold-300 disabled:opacity-60"
      >
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Abone Ol"
        )}
      </button>
      {error && (
        <span className="text-xs text-red-300 sm:absolute sm:mt-12">
          {error}
        </span>
      )}
    </form>
  );
}

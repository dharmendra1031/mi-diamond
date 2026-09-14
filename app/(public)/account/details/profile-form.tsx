"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateProfileAction } from "@/app/(public)/account/actions";

export function ProfileForm({
  email,
  fullName,
  phone,
}: {
  email: string;
  fullName: string;
  phone: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProfileAction(fd);
      if (result?.error) {
        setError(result.error);
      } else {
        router.replace("/account/details?ok=1");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-md">
      <Field label="Email" value={email} readOnly />
      <Field label="Full Name" name="full_name" defaultValue={fullName} />
      <Field
        label="Phone"
        name="phone"
        type="tel"
        defaultValue={phone}
        placeholder="05xx xxx xx xx"
      />

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink-700 px-6 py-2.5 text-sm font-medium text-cream hover:bg-ink-600 disabled:opacity-60"
      >
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Saving
          </span>
        ) : (
          "Save"
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm">
      <span className="text-ink-700 font-medium">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none disabled:opacity-60 read-only:bg-ink-50 read-only:text-ink-400"
      />
    </label>
  );
}

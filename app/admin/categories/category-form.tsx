"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { upsertCategoryAction } from "@/app/admin/actions";

type Props = {
  category?: {
    id: string;
    name: string;
    slug: string;
    sort_order: number;
    description: string | null;
  };
  onCancel?: () => void;
};

export function CategoryForm({ category, onCancel }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    if (category) fd.set("id", category.id);
    startTransition(async () => {
      const result = await upsertCategoryAction(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <input
        name="name"
        defaultValue={category?.name}
        placeholder="Category Name"
        required
        className="w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
      />
      <input
        name="slug"
        defaultValue={category?.slug}
        placeholder="url-slug (auto-generated if blank)"
        className="w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
      />
      <input
        name="sort_order"
        type="number"
        defaultValue={category?.sort_order ?? 0}
        placeholder="Sort order (0 = top)"
        className="w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
      />
      <textarea
        name="description"
        defaultValue={category?.description ?? ""}
        rows={3}
        placeholder="Description (optional)"
        className="w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
      />

      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-full bg-ink-700 py-2.5 text-sm font-medium text-cream hover:bg-ink-600 disabled:opacity-60"
        >
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Saving
            </span>
          ) : (
            category ? "Update" : "Add"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-ink-200 px-4 text-sm text-ink-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

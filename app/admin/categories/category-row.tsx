"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { deleteCategoryAction } from "@/app/admin/actions";
import { CategoryForm } from "./category-form";

export function CategoryRow({
  id,
  name,
  slug,
  sort_order,
  description,
  productCount,
}: {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  description: string | null;
  productCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (productCount > 0) {
      if (
        !confirm(
          `This category has ${productCount} products. If deleted, those products will be uncategorized. Continue?`,
        )
      ) {
        return;
      }
    } else if (!confirm(`Delete category "${name}"?`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (result?.error) alert(result.error);
    });
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={5} className="px-4 py-4 bg-cream/40">
          <div className="max-w-md">
            <CategoryForm
              category={{ id, name, slug, sort_order, description }}
              onCancel={() => setEditing(false)}
            />
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-cream/40">
      <td className="px-4 py-3 text-ink-500 w-16">{sort_order}</td>
      <td className="px-4 py-3 font-medium text-ink-700">{name}</td>
      <td className="px-4 py-3 font-mono text-xs text-ink-400">/{slug}</td>
      <td className="px-4 py-3 text-right text-ink-500">{productCount}</td>
      <td className="px-4 py-3 text-right">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-ink-500 hover:text-ink-700"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={pending}
            className="text-ink-400 hover:text-red-500 disabled:opacity-50"
            aria-label="Delete"
          >
            {pending ? <X className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </td>
    </tr>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Upload, X, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/app/admin/actions";
import type { Category, Product } from "@/lib/supabase/types";

const METAL_OPTIONS = [
  "14 K White Gold",
  "14 K Yellow Gold",
  "14 K Rose Gold",
  "18 K White Gold",
  "18 K Yellow Gold",
  "18 K Rose Gold",
  "925 Silver",
  "Platin",
];

const STONE_OPTIONS = [
  "Diamond",
  "Zirkon",
  "Yakut",
  "Emerald",
  "Safir",
  "Pearl",
  "Tek Stone",
];

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("products")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("products").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      setImages((prev) => [...prev, ...uploaded]);
    } catch (e) {
      setError(
        e instanceof Error
          ? `Upload failed: ${e.message}`
          : "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.delete("images");
    images.forEach((url) => fd.append("images", url));

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, fd)
        : await createProductAction(fd);
      if (result?.error) setError(result.error);
    });
  }

  function onDelete() {
    if (!product) return;
    if (!confirm(`"${product.name}" product be deleted?`)) return;
    startTransition(async () => {
      await deleteProductAction(product.id);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Section title="Temel Bilgiler">
          <Field label="Product Name *" name="name" defaultValue={product?.name} required />
          <Field
            label="Description"
            name="description"
            defaultValue={product?.description ?? ""}
            multiline
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <SelectField
              label="Category"
              name="category_id"
              defaultValue={product?.category_id ?? ""}
            >
              <option value="">Select</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Stok Statusu"
              name="stock_status"
              defaultValue={product?.stock_status ?? "available"}
            >
              <option value="available">In Stock</option>
              <option value="on_request">Made to Order</option>
              <option value="sold_out">Sold Out</option>
            </SelectField>
          </div>
        </Section>

        <Section title="Price & Discount">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Sale Price (TL) *"
              name="price"
              type="number"
              step="0.01"
              defaultValue={product?.price}
              required
            />
            <Field
              label="Old Price (TL) - for discount"
              name="old_price"
              type="number"
              step="0.01"
              defaultValue={product?.old_price ?? ""}
              hint="If left blank, no discount is shown. The discount rate is calculated automatically."
            />
          </div>
        </Section>

        <Section title="Product Details">
          <div className="grid sm:grid-cols-2 gap-4">
            <ComboField
              label="Metal"
              name="metal"
              defaultValue={product?.metal ?? ""}
              options={METAL_OPTIONS}
            />
            <ComboField
              label="Stone"
              name="stone"
              defaultValue={product?.stone ?? ""}
              options={STONE_OPTIONS}
            />
            <Field
              label="Karat / Boyut"
              name="carat"
              defaultValue={product?.carat ?? ""}
              placeholder="0.25 ct"
            />
            <Field
              label="Ring Size"
              name="ring_size"
              defaultValue={product?.ring_size ?? ""}
              placeholder="13–18 / Ayarlanabilir"
            />
          </div>
        </Section>

        <Section title="Images">
          <div className="rounded-xl border-2 border-dashed border-ink-200 bg-cream/40 p-6 text-center">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              hidden
              disabled={uploading}
              onChange={(e) => {
                if (e.target.files?.length) uploadFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <label
              htmlFor="image-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink-700 px-5 py-2 text-sm text-cream hover:bg-ink-600"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Upload Photo
                </>
              )}
            </label>
            <p className="mt-2 text-xs text-ink-400">
              You can select multiple images. The first image becomes the cover.
            </p>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {images.map((url, idx) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-ink-50"
                >
                  <Image
                    src={url}
                    alt={`Image ${idx + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-medium text-ink-700">
                      Kapak
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-ink-700/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => moveImage(idx, idx - 1)}
                      className="text-white/80 hover:text-white text-xs"
                      aria-label="Move up"
                    >
                      <GripVertical className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-white/80 hover:text-red-300"
                      aria-label="Sil"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-10 lg:h-fit">
        <Section title="Publishing">
          <Toggle
            name="is_published"
            label="Publishingda"
            description="Visible on the site."
            defaultChecked={product?.is_published ?? true}
          />
          <Toggle
            name="is_featured"
            label="Featured"
            description="Shown on the homepage."
            defaultChecked={product?.is_featured ?? false}
          />
        </Section>

        <div className="space-y-3">
          <button
            type="submit"
            disabled={pending || uploading}
            className="w-full rounded-full bg-ink-700 py-3 text-sm font-medium text-cream transition hover:bg-ink-600 disabled:opacity-60"
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </span>
            ) : product ? (
              "Save Changes"
            ) : (
              "Add Product"
            )}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="w-full rounded-full border border-ink-200 bg-white py-3 text-sm text-ink-500 hover:text-ink-700"
          >
            Cancel
          </button>

          {product && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full text-xs text-red-500 hover:underline"
            >
              Delete this product
            </button>
          )}
        </div>
      </aside>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <h2 className="font-serif text-lg text-ink-700 mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  multiline,
  hint,
  ...rest
}: {
  label: string;
  multiline?: boolean;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-sm">
      <span className="text-ink-700 font-medium">{label}</span>
      {multiline ? (
        <textarea
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={4}
          className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
        />
      ) : (
        <input
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
        />
      )}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

function SelectField({
  label,
  children,
  ...rest
}: {
  label: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block text-sm">
      <span className="text-ink-700 font-medium">{label}</span>
      <select
        {...rest}
        className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
      >
        {children}
      </select>
    </label>
  );
}

function ComboField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label className="block text-sm">
      <span className="text-ink-700 font-medium">{label}</span>
      <input
        list={`${name}-options`}
        name={name}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none"
      />
      <datalist id={`${name}-options`}>
        {options.map((o) => (
          <option key={o} value={o} />
        ))}
      </datalist>
    </label>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 rounded border-ink-300 accent-ink-700"
      />
      <span>
        <span className="block text-sm font-medium text-ink-700">{label}</span>
        <span className="block text-xs text-ink-400">{description}</span>
      </span>
    </label>
  );
}

"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GripVertical, Loader2, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createProductFormAction,
  updateProductFormAction,
  deleteProductAction,
} from "@/app/admin/actions";
import type { Category, Product } from "@/lib/supabase/types";

const METAL_OPTIONS = [
  "18K Yellow Gold",
  "18K White Gold",
  "18K Rose Gold",
  "21K Yellow Gold",
  "22K Yellow Gold",
  "Platinum",
];

const STONE_OPTIONS = [
  "Diamond",
  "Emerald",
  "Ruby",
  "Sapphire",
  "Pearl",
  "No Stone",
];

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [deletePending, startTransition] = useTransition();
  const action = product
    ? updateProductFormAction.bind(null, product.id)
    : createProductFormAction;
  const [state, formAction] = useActionState(action, { error: null });
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
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(path, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("products").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      setImages((current) => [...current, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? `Upload failed: ${err.message}` : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    setImages((current) => current.filter((_, i) => i !== index));
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;

    setImages((current) => {
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function onDelete() {
    if (!product) return;
    if (!confirm(`Delete "${product.name}"?`)) return;

    startTransition(async () => {
      await deleteProductAction(product.id);
    });
  }

  const displayError = error ?? state.error;

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Section title="Basic Information">
          <Field label="Product Name *" name="name" defaultValue={product?.name} required />
          <Field
            label="Description"
            name="description"
            defaultValue={product?.description ?? ""}
            multiline
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField label="Category" name="category_id" defaultValue={product?.category_id ?? ""}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </SelectField>
            <SelectField label="Availability" name="stock_status" defaultValue={product?.stock_status ?? "available"}>
              <option value="available">Available</option>
              <option value="on_request">On Request</option>
              <option value="sold_out">Sold Out</option>
            </SelectField>
          </div>
        </Section>

        <Section title="Price">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Price (KWD) *"
              name="price"
              type="number"
              min="0"
              step="0.001"
              defaultValue={product?.price}
              required
            />
            <Field
              label="Old Price (KWD)"
              name="old_price"
              type="number"
              min="0"
              step="0.001"
              defaultValue={product?.old_price ?? ""}
              hint="Optional. Use this only when showing a discount."
            />
          </div>
        </Section>

        <Section title="Product Details">
          <div className="grid gap-4 sm:grid-cols-2">
            <ComboField label="Metal" name="metal" defaultValue={product?.metal ?? ""} options={METAL_OPTIONS} />
            <ComboField label="Stone" name="stone" defaultValue={product?.stone ?? ""} options={STONE_OPTIONS} />
            <Field label="Carat / Weight" name="carat" defaultValue={product?.carat ?? ""} placeholder="1.03 ct / 37 g" />
            <Field label="Size" name="ring_size" defaultValue={product?.ring_size ?? ""} placeholder="Optional" />
          </div>
        </Section>

        <Section title="Product Images">
          {images.map((url, index) => (
            <input key={`${url}-${index}`} type="hidden" name="images" value={url} />
          ))}

          <div className="rounded-xl border-2 border-dashed border-ink-200 bg-cream/40 p-6 text-center">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              multiple
              hidden
              disabled={uploading}
              onChange={(event) => {
                if (event.target.files?.length) uploadFiles(event.target.files);
                event.target.value = "";
              }}
            />
            <label
              htmlFor="image-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-ink-700 px-5 py-2 text-sm text-cream hover:bg-ink-600"
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="h-4 w-4" /> Upload Photos</>
              )}
            </label>
            <p className="mt-2 text-xs text-ink-500">
              Select one or more square or vertical product photos. The first image is used as the product cover.
            </p>
          </div>

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((url, index) => (
                <div key={`${url}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg bg-cream">
                  <Image src={url} alt={`Product image ${index + 1}`} fill sizes="120px" className="object-contain p-1" />
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded-full bg-gold-400 px-2 py-0.5 text-[10px] font-medium text-ink-700">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-gradient-to-t from-ink-700/80 to-transparent p-1.5 opacity-0 transition group-hover:opacity-100">
                    <button type="button" onClick={() => moveImage(index, index - 1)} className="text-white/80 hover:text-white" aria-label="Move image left">
                      <GripVertical className="h-3.5 w-3.5 -rotate-90" />
                    </button>
                    <button type="button" onClick={() => removeImage(index)} className="text-white/80 hover:text-red-300" aria-label="Remove image">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {displayError && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{displayError}</div>}
      </div>

      <aside className="space-y-6 lg:sticky lg:top-10 lg:h-fit">
        <Section title="Visibility">
          <Toggle name="is_published" label="Published" description="Visible on the website." defaultChecked={product?.is_published ?? true} />
          <Toggle name="is_featured" label="Featured" description="Highlight on the homepage." defaultChecked={product?.is_featured ?? false} />
        </Section>

        <div className="space-y-3">
          <SubmitButton uploading={uploading} label={product ? "Save Changes" : "Add Product"} />

          <button type="button" onClick={() => router.back()} className="w-full rounded-full border border-ink-200 bg-white py-3 text-sm text-ink-500 hover:text-ink-700">
            Cancel
          </button>

          {product && (
            <button type="button" disabled={deletePending} onClick={onDelete} className="w-full text-xs text-red-500 hover:underline disabled:opacity-60">
              {deletePending ? "Deleting..." : "Delete this product"}
            </button>
          )}
        </div>
      </aside>
    </form>
  );
}

function SubmitButton({ uploading, label }: { uploading: boolean; label: string }) {
  const { pending } = useFormStatus();
  const disabled = pending || uploading;

  return (
    <button type="submit" disabled={disabled} className="w-full rounded-full bg-ink-700 py-3 text-sm font-medium text-cream transition hover:bg-ink-600 disabled:opacity-60">
      {disabled ? (
        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {uploading ? "Uploading..." : "Saving..."}</span>
      ) : label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <h2 className="mb-4 font-serif text-lg text-ink-700">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, multiline, hint, ...rest }: {
  label: string;
  multiline?: boolean;
  hint?: string;
} & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink-700">{label}</span>
      {multiline ? (
        <textarea {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} rows={4} className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none" />
      ) : (
        <input {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none" />
      )}
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

function SelectField({ label, children, ...rest }: {
  label: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink-700">{label}</span>
      <select {...rest} className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none">
        {children}
      </select>
    </label>
  );
}

function ComboField({ label, name, defaultValue, options }: {
  label: string;
  name: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-ink-700">{label}</span>
      <input list={`${name}-options`} name={name} defaultValue={defaultValue} className="mt-1 w-full rounded-lg border border-ink-200 bg-cream/50 px-4 py-2.5 text-sm focus:border-ink-700 focus:outline-none" />
      <datalist id={`${name}-options`}>
        {options.map((option) => <option key={option} value={option} />)}
      </datalist>
    </label>
  );
}

function Toggle({ name, label, description, defaultChecked }: {
  name: string;
  label: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-4 w-4 rounded border-ink-300 accent-ink-700" />
      <span>
        <span className="block text-sm font-medium text-ink-700">{label}</span>
        <span className="block text-xs text-ink-400">{description}</span>
      </span>
    </label>
  );
}

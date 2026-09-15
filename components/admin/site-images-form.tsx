"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/local-data/client";
import type { SiteAsset, SiteAssetKey } from "@/lib/site-assets";

const definitions: Array<{ key: SiteAssetKey; label: string; hint: string }> = [
  { key: "logo", label: "Site Logo", hint: "Used in header, footer and admin branding." },
  {
    key: "home_hero",
    label: "Home Hero Image",
    hint: "Main homepage campaign image. Use a wide jewellery photo around 2400x1600px with the product centered.",
  },
  { key: "about_image", label: "About Page Image", hint: "Main image on the About page." },
];

export function SiteImagesForm({ assets }: { assets: SiteAsset[] }) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<SiteAssetKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = Object.fromEntries(assets.map((asset) => [asset.key, asset])) as Partial<Record<SiteAssetKey, SiteAsset>>;

  async function upload(key: SiteAssetKey, file: File) {
    setBusyKey(key);
    setError(null);

    try {
      const dataClient = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${key}/${Date.now()}.${ext}`;

      const { error: uploadError } = await dataClient.storage
        .from("site-assets")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: publicData } = dataClient.storage.from("site-assets").getPublicUrl(path);
      const definition = definitions.find((item) => item.key === key)!;

      const { error: saveError } = await dataClient.from("site_assets").upsert(
        {
          key,
          label: definition.label,
          image_url: publicData.publicUrl,
          storage_path: path,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" },
      );
      if (saveError) throw saveError;

      const oldPath = current[key]?.storage_path;
      if (oldPath && oldPath !== path) {
        await dataClient.storage.from("site-assets").remove([oldPath]);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setBusyKey(null);
    }
  }

  async function remove(key: SiteAssetKey) {
    setBusyKey(key);
    setError(null);

    try {
      const dataClient = createClient();
      const oldPath = current[key]?.storage_path;

      const { error: saveError } = await dataClient
        .from("site_assets")
        .update({ image_url: null, storage_path: null, updated_at: new Date().toISOString() })
        .eq("key", key);
      if (saveError) throw saveError;

      if (oldPath) await dataClient.storage.from("site-assets").remove([oldPath]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image removal failed.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {definitions.map((definition) => {
          const asset = current[definition.key];
          const busy = busyKey === definition.key;

          return (
            <section key={definition.key} className="rounded-2xl bg-white p-5 shadow-soft">
              <div className="mb-4">
                <h2 className="font-serif text-xl text-ink-700">{definition.label}</h2>
                <p className="mt-1 text-xs leading-5 text-ink-400">{definition.hint}</p>
              </div>

              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-ink-700/10 bg-cream">
                {asset?.image_url ? (
                  <Image src={asset.image_url} alt={definition.label} fill sizes="420px" className="object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-ink-300">No image uploaded</div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink-700 px-4 py-2.5 text-xs font-medium text-cream hover:bg-ink-600">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {asset?.image_url ? "Replace" : "Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={busy}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) upload(definition.key, file);
                      event.target.value = "";
                    }}
                  />
                </label>

                {asset?.image_url && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove(definition.key)}
                    className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 text-red-500 hover:bg-red-50 disabled:opacity-60"
                    aria-label={`Remove ${definition.label}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

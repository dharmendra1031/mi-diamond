import { ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SiteImagesForm } from "@/components/admin/site-images-form";
import type { SiteAsset } from "@/lib/site-assets";

export const dynamic = "force-dynamic";

export default async function SiteImagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_assets")
    .select("key, label, image_url, storage_path")
    .order("label");

  return (
    <>
      <div className="mb-8 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-soft">
          <ImageIcon className="h-5 w-5 text-gold-500" />
        </div>
        <div>
          <h1 className="font-serif text-3xl text-ink-700">Site Images</h1>
          <p className="mt-1 text-sm text-ink-500">
            Upload and replace branding images used across the website.
          </p>
        </div>
      </div>

      <SiteImagesForm assets={(data ?? []) as SiteAsset[]} />
    </>
  );
}

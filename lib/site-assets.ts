import { createClient } from "@/lib/supabase/server";

export type SiteAssetKey = "logo" | "home_hero" | "about_image";

export type SiteAsset = {
  key: SiteAssetKey;
  label: string;
  image_url: string | null;
  storage_path: string | null;
};

export async function getSiteAssetMap(
  keys?: SiteAssetKey[],
): Promise<Partial<Record<SiteAssetKey, string>>> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("site_assets")
      .select("key, image_url")
      .not("image_url", "is", null);

    if (keys?.length) query = query.in("key", keys);

    const { data, error } = await query;
    if (error) return {};

    return Object.fromEntries(
      (data ?? [])
        .filter((item) => item.image_url)
        .map((item) => [item.key, item.image_url]),
    ) as Partial<Record<SiteAssetKey, string>>;
  } catch {
    return {};
  }
}

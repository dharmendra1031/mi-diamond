"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// =====================================================
// PRODUCTS
// =====================================================

function parsePrice(value: FormDataEntryValue | null): number {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^\d,.-]/g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseOptionalPrice(value: FormDataEntryValue | null): number | null {
  if (!value || !String(value).trim()) return null;
  const n = parsePrice(value);
  return n > 0 ? n : null;
}

export async function createProductAction(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Product name is required." };

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

  const price = parsePrice(formData.get("price"));
  const oldPrice = parseOptionalPrice(formData.get("old_price"));

  const images = formData.getAll("images").map(String).filter(Boolean);

  const payload = {
    slug,
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    category_id: String(formData.get("category_id") ?? "") || null,
    price,
    old_price: oldPrice && oldPrice > price ? oldPrice : null,
    images,
    metal: String(formData.get("metal") ?? "").trim() || null,
    stone: String(formData.get("stone") ?? "").trim() || null,
    carat: String(formData.get("carat") ?? "").trim() || null,
    ring_size: String(formData.get("ring_size") ?? "").trim() || null,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
    stock_status: String(formData.get("stock_status") ?? "available"),
  };

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}?ok=1`);
}

export async function updateProductAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Product name is required." };

  const price = parsePrice(formData.get("price"));
  const oldPrice = parseOptionalPrice(formData.get("old_price"));
  const images = formData.getAll("images").map(String).filter(Boolean);

  const payload = {
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    category_id: String(formData.get("category_id") ?? "") || null,
    price,
    old_price: oldPrice && oldPrice > price ? oldPrice : null,
    images,
    metal: String(formData.get("metal") ?? "").trim() || null,
    stone: String(formData.get("stone") ?? "").trim() || null,
    carat: String(formData.get("carat") ?? "").trim() || null,
    ring_size: String(formData.get("ring_size") ?? "").trim() || null,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
    stock_status: String(formData.get("stock_status") ?? "available"),
  };

  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/[slug]`, "page");
  revalidatePath("/admin/products");
  redirect(`/admin/products/${id}?ok=1`);
}

export async function deleteProductAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

// =====================================================
// CATEGORIES
// =====================================================

export async function upsertCategoryAction(formData: FormData) {
  const supabase = await createClient();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Category name is required." };

  const slug = String(formData.get("slug") ?? slugify(name)).trim();
  const sort_order = parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;
  const description = String(formData.get("description") ?? "").trim() || null;

  if (id) {
    const { error } = await supabase
      .from("categories")
      .update({ name, slug, sort_order, description })
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("categories")
      .insert({ name, slug, sort_order, description });
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?ok=1");
}

export async function deleteCategoryAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}

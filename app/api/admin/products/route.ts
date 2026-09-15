import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";
import { requireAdmin } from "@/lib/local-auth";

export const runtime = "nodejs";

function fail(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

function parsePrice(value: FormDataEntryValue | null): number {
  if (!value) return 0;
  const cleaned = String(value).replace(/[^\d,.-]/g, "").replace(",", ".");
  const number = parseFloat(cleaned);
  return Number.isFinite(number) ? number : 0;
}

function parseOptionalPrice(value: FormDataEntryValue | null): number | null {
  if (!value || !String(value).trim()) return null;
  const number = parsePrice(value);
  return number > 0 ? number : null;
}

type ProductPayloadResult =
  | { payload: Record<string, unknown> }
  | { error: string };

function productPayload(formData: FormData, existingSlug?: string): ProductPayloadResult {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Product name is required." };

  const price = parsePrice(formData.get("price"));
  const oldPrice = parseOptionalPrice(formData.get("old_price"));

  return {
    payload: {
      ...(existingSlug ? {} : { slug: `${slugify(name)}-${Date.now().toString(36).slice(-4)}` }),
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      category_id: String(formData.get("category_id") ?? "") || null,
      price,
      old_price: oldPrice && oldPrice > price ? oldPrice : null,
      currency: "KWD",
      images: formData.getAll("images").map(String).filter(Boolean),
      metal: String(formData.get("metal") ?? "").trim() || null,
      stone: String(formData.get("stone") ?? "").trim() || null,
      carat: String(formData.get("carat") ?? "").trim() || null,
      ring_size: String(formData.get("ring_size") ?? "").trim() || null,
      is_published: formData.get("is_published") === "on",
      is_featured: formData.get("is_featured") === "on",
      stock_status: String(formData.get("stock_status") ?? "available"),
    },
  };
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Administrator access required.", 401);

    const formData = await request.formData();
    const parsed = productPayload(formData);
    if ("error" in parsed) return fail(parsed.error);

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .insert(parsed.payload)
      .select("id")
      .single();
    if (error) return fail(error.message, 500);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return NextResponse.json({ data: { id: data.id }, error: null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Product create failed.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Administrator access required.", 401);

    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    if (!id) return fail("Product id is required.");

    const parsed = productPayload(formData, "existing");
    if ("error" in parsed) return fail(parsed.error);

    const supabase = await createClient();
    const { error } = await supabase.from("products").update(parsed.payload).eq("id", id);
    if (error) return fail(error.message, 500);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath(`/products/[slug]`, "page");
    revalidatePath("/admin/products");
    return NextResponse.json({ data: { id }, error: null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Product update failed.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Administrator access required.", 401);

    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) return fail("Product id is required.");

    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return fail(error.message, 500);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Product delete failed.", 500);
  }
}

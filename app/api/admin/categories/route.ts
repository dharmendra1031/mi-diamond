import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/local-data/server";
import { slugify } from "@/lib/format";
import { requireAdmin } from "@/lib/local-auth";

export const runtime = "nodejs";

function fail(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Administrator access required.", 401);

    const formData = await request.formData();
    const id = String(formData.get("id") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return fail("Category name is required.");

    const enteredSlug = String(formData.get("slug") ?? "").trim();
    const slug = slugify(enteredSlug || name);
    if (!slug) return fail("Category slug could not be generated.");

    const sortOrder = parseInt(String(formData.get("sort_order") ?? "0"), 10) || 0;
    const description = String(formData.get("description") ?? "").trim() || null;
    const dataClient = await createClient();

    if (id) {
      const { error } = await dataClient
        .from("categories")
        .update({ name, slug, sort_order: sortOrder, description })
        .eq("id", id);
      if (error) return fail(error.message, 500);
    } else {
      const { error } = await dataClient
        .from("categories")
        .insert({ name, slug, sort_order: sortOrder, description });
      if (error) return fail(error.message, 500);
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/categories");
    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Category save failed.", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) return fail("Administrator access required.", 401);

    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) return fail("Category id is required.");

    const dataClient = await createClient();
    const { error: productError } = await dataClient
      .from("products")
      .update({ category_id: null })
      .eq("category_id", id);
    if (productError) return fail(productError.message, 500);

    const { error } = await dataClient.from("categories").delete().eq("id", id);
    if (error) return fail(error.message, 500);

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/categories");
    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Category delete failed.", 500);
  }
}

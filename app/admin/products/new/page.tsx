import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Products
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-ink-700">New Product</h1>
      <p className="mt-1 text-sm text-ink-500">
        Fill out the form to add a new product.
      </p>

      <div className="mt-8">
        <ProductForm categories={categories ?? []} />
      </div>
    </>
  );
}

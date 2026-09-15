import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/local-data/server";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
};

export default async function EditProductPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { ok } = await searchParams;

  const dataClient = await createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    dataClient.from("products").select("*").eq("id", id).maybeSingle(),
    dataClient.from("categories").select("*").order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>
        {product.is_published && (
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-700"
          >
            View on site <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
      <h1 className="mt-4 font-serif text-3xl text-ink-700">{product.name}</h1>
      <p className="mt-1 text-sm text-ink-500">
        Update product details.
      </p>

      {ok && (
        <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Changes saved.
        </div>
      )}

      <div className="mt-8">
        <ProductForm product={product} categories={categories ?? []} />
      </div>
    </>
  );
}

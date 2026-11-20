import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

export default async function NewProductPage() {
  await requireAdminCapability("products");
  const supabase = await createClient();
  const [{ data: categories, error: categoriesError }, { data: brands, error: brandsError }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);
  if (categoriesError || brandsError) return <ErrorMessage error={categoriesError ?? brandsError} />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <Link href="/admin/products" className="text-sm font-medium text-neutral-500 transition hover:text-black">
          Products
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Add product</h1>
        <p className="text-sm text-neutral-500">Add the basic details first. Photos and variants can be added after saving.</p>
      </header>

      <ProductForm categories={categories ?? []} brands={brands ?? []} />
    </div>
  );
}

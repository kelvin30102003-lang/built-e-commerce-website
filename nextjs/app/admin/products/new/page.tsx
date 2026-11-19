import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: brands }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.from("brands").select("id, name").order("name"),
  ]);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Add Product</h1>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
        <span className="mt-0.5 text-base">💡</span>
        <span>
          Fill in the product details and click <strong>Create Product</strong>.
          You can upload images and add variants on the next screen.
        </span>
      </div>

      <ProductForm categories={categories ?? []} brands={brands ?? []} />
    </div>
  );
}

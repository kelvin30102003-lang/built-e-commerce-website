import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMmk } from "@/lib/shop/format";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-black text-white",
  draft: "bg-neutral-100 text-neutral-700",
  inactive: "bg-neutral-200 text-neutral-700",
  archived: "bg-neutral-100 text-neutral-500",
};

export default async function AdminProductsPage() {
  await requireAdminCapability("products");
  const supabase = await createClient();
  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, name, status, categories(name), brands(name), product_variants(price, stock_quantity)",
    )
    .order("created_at", { ascending: false });
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
        >
          Add Product
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-neutral-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(products ?? []).map((product) => {
              const variants = product.product_variants ?? [];
              const minPrice = variants.length ? Math.min(...variants.map((v) => v.price)) : null;
              const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
              return (
                <tr key={product.id} className="transition-colors hover:bg-neutral-50/70">
                  <td className="px-4 py-2 font-medium text-slate-800">{product.name}</td>
                  <td className="px-4 py-2 text-slate-500">{product.categories?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-500">{product.brands?.name ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {minPrice !== null ? formatMmk(minPrice) : "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{totalStock}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[product.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/admin/products/${product.id}`} className="font-medium text-neutral-700 underline-offset-4 hover:text-black hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {(products ?? []).length === 0 && (
          <p className="p-4 text-sm text-slate-500">No products yet.</p>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMmk } from "@/lib/shop/format";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  draft: "bg-slate-100 text-slate-600",
  inactive: "bg-amber-100 text-amber-700",
  archived: "bg-red-100 text-red-600",
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
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add Product
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-pink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-left text-slate-600">
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
          <tbody className="divide-y divide-pink-50">
            {(products ?? []).map((product) => {
              const variants = product.product_variants ?? [];
              const minPrice = variants.length ? Math.min(...variants.map((v) => v.price)) : null;
              const totalStock = variants.reduce((sum, v) => sum + v.stock_quantity, 0);
              return (
                <tr key={product.id}>
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
                    <Link href={`/admin/products/${product.id}`} className="text-primary hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(products ?? []).length === 0 && (
          <p className="p-4 text-sm text-slate-500">No products yet.</p>
        )}
      </div>
    </div>
  );
}

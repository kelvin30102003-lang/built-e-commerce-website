"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/lib/actions/admin/products";

type Option = { id: number; name: string };

type Product = {
  id: number;
  name: string;
  short_description: string | null;
  description: string | null;
  category_id: number | null;
  brand_id: number | null;
  status: string;
};

const inputClass = "mt-1 block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100";

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product?: Product;
  categories: Option[];
  brands: Option[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = product
          ? await updateProductAction(product.id, formData)
          : await createProductAction(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        setError(null);
        if (!product && "productId" in result && result.productId) {
          router.push(`/admin/products/${result.productId}`);
          return;
        }
        router.refresh();
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not save the product. Please try again.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-7">
      <div>
        <label htmlFor="product-name" className="text-sm font-medium text-slate-800">Name</label>
        <input
          id="product-name"
          type="text"
          name="name"
          defaultValue={product?.name}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="product-short-description" className="text-sm font-medium text-slate-800">Short description</label>
        <input
          id="product-short-description"
          type="text"
          name="short_description"
          defaultValue={product?.short_description ?? ""}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="product-description" className="text-sm font-medium text-slate-800">Description</label>
        <textarea
          id="product-description"
          name="description"
          defaultValue={product?.description ?? ""}
          rows={4}
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="product-category" className="text-sm font-medium text-slate-800">Category</label>
          <select
            id="product-category"
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className={inputClass}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="product-brand" className="text-sm font-medium text-slate-800">Brand</label>
          <select
            id="product-brand"
            name="brand_id"
            defaultValue={product?.brand_id ?? ""}
            className={inputClass}
          >
            <option value="">None</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="product-status" className="text-sm font-medium text-slate-800">Status</label>
        <select
          id="product-status"
          name="status"
          defaultValue={product?.status ?? "draft"}
          className={inputClass}
        >
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-50"
      >
        {isPending ? "Saving..." : product ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}

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
      const result = product
        ? await updateProductAction(product.id, formData)
        : await createProductAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4 rounded-xl border border-pink-100 bg-white p-5">
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          defaultValue={product?.name}
          required
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Short Description</label>
        <input
          type="text"
          name="short_description"
          defaultValue={product?.short_description ?? ""}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={4}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Category</label>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
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
          <label className="text-sm font-medium">Brand</label>
          <select
            name="brand_id"
            defaultValue={product?.brand_id ?? ""}
            className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
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
        <label className="text-sm font-medium">Status</label>
        <select
          name="status"
          defaultValue={product?.status ?? "draft"}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
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
        className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "Saving..." : product ? "Save Changes" : "Create Product"}
      </button>
    </form>
  );
}

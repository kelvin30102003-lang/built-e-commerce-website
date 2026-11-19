"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCategoryAction, updateCategoryAction } from "@/lib/actions/admin/categories";

type Category = {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  is_active: boolean;
  is_color_filter_category: boolean;
  sort_order: number;
};

export function CategoryForm({
  category,
  categories,
  onDone,
}: {
  category?: Category;
  categories: Category[];
  onDone: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = category
        ? await updateCategoryAction(category.id, formData)
        : await createCategoryAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
      onDone();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3 rounded-xl border border-pink-100 bg-white p-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          name="name"
          defaultValue={category?.name}
          required
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          defaultValue={category?.description ?? ""}
          rows={2}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Parent Category</label>
        <select
          name="parent_id"
          defaultValue={category?.parent_id ?? ""}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        >
          <option value="">None</option>
          {categories
            .filter((c) => c.id !== category?.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Sort Order</label>
        <input
          type="number"
          name="sort_order"
          defaultValue={category?.sort_order ?? 0}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_active"
          id="is_active"
          defaultChecked={category?.is_active ?? true}
        />
        <label htmlFor="is_active" className="text-sm">
          Active
        </label>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_color_filter_category"
          id="is_color_filter_category"
          defaultChecked={category?.is_color_filter_category ?? false}
        />
        <label htmlFor="is_color_filter_category" className="text-sm">
          Show Shop by Color for products in this category
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-full border border-pink-200 px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

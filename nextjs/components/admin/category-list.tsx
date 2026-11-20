"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryForm } from "./category-form";
import { deleteCategoryAction } from "@/lib/actions/admin/categories";

type Category = {
  id: number;
  name: string;
  description: string | null;
  parent_id: number | null;
  is_active: boolean;
  sort_order: number;
};

export function CategoryList({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | "new" | null>(null);
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Delete this category?")) return;
    await deleteCategoryAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <CategoryForm categories={categories} onDone={() => setEditing(null)} />
      ) : (
        <button
          onClick={() => setEditing("new")}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add Category
        </button>
      )}

      <div className="overflow-hidden rounded-xl border border-pink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Parent</th>
              <th className="px-4 py-2">Sort</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {categories.map((category) =>
              editing !== "new" && editing?.id === category.id ? (
                <tr key={category.id}>
                  <td colSpan={5} className="p-2">
                    <CategoryForm
                      category={category}
                      categories={categories}
                      onDone={() => setEditing(null)}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={category.id}>
                  <td className="px-4 py-2 font-medium text-slate-800">{category.name}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {categories.find((c) => c.id === category.parent_id)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{category.sort_order}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        category.is_active
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      }
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => setEditing(category)}
                      className="mr-3 text-primary hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {categories.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No categories yet.</p>
        )}
      </div>
    </div>
  );
}

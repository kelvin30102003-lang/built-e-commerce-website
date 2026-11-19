"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandForm } from "./brand-form";
import { deleteBrandAction } from "@/lib/actions/admin/brands";

type Brand = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
};

export function BrandList({ brands }: { brands: Brand[] }) {
  const [editing, setEditing] = useState<Brand | "new" | null>(null);
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Delete this brand?")) return;
    await deleteBrandAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <BrandForm onDone={() => setEditing(null)} />
      ) : (
        <button
          onClick={() => setEditing("new")}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add Brand
        </button>
      )}

      <div className="overflow-hidden rounded-xl border border-pink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {brands.map((brand) =>
              editing !== "new" && editing?.id === brand.id ? (
                <tr key={brand.id}>
                  <td colSpan={3} className="p-2">
                    <BrandForm brand={brand} onDone={() => setEditing(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={brand.id}>
                  <td className="px-4 py-2 font-medium text-slate-800">{brand.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        brand.is_active
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      }
                    >
                      {brand.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing(brand)} className="mr-3 text-primary hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(brand.id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {brands.length === 0 && <p className="p-4 text-sm text-slate-500">No brands yet.</p>}
      </div>
    </div>
  );
}

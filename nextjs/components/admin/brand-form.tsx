"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrandAction, updateBrandAction } from "@/lib/actions/admin/brands";

type Brand = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
};

export function BrandForm({ brand, onDone }: { brand?: Brand; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = brand
        ? await updateBrandAction(brand.id, formData)
        : await createBrandAction(formData);
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
          defaultValue={brand?.name}
          required
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          defaultValue={brand?.description ?? ""}
          rows={2}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="is_active" id="is_active" defaultChecked={brand?.is_active ?? true} />
        <label htmlFor="is_active" className="text-sm">
          Active
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

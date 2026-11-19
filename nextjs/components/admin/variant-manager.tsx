"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVariantAction, deleteVariantAction, updateVariantAction } from "@/lib/actions/admin/products";
import { formatMmk } from "@/lib/shop/format";

type Variant = {
  id: number;
  sku: string;
  variant_name: string | null;
  color_id: number | null;
  color: { name: string } | null;
  price: number;
  compare_price: number | null;
  stock_quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
};

function VariantForm({
  productId,
  variant,
  colors,
  requiresColor,
  onDone,
}: {
  productId: number;
  variant?: Variant;
  colors: { id: number; name: string }[];
  requiresColor: boolean;
  onDone: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = variant
        ? await updateVariantAction(variant.id, productId, formData)
        : await createVariantAction(productId, formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
      onDone();
    });
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-2 gap-3 rounded-lg border border-pink-100 bg-pink-50/40 p-3">
      <div>
        <label className="text-xs font-medium">SKU</label>
        <input
          name="sku"
          defaultValue={variant?.sku}
          required
          className="mt-1 block w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium">Variant Name</label>
        <input
          name="variant_name"
          defaultValue={variant?.variant_name ?? ""}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium">{requiresColor ? "Lens Color" : "Color"}</label>
        <select
          name="color_id"
          defaultValue={variant?.color_id ?? ""}
          required={requiresColor}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm"
        >
          {!requiresColor && <option value="">No color</option>}
          {requiresColor && <option value="">Choose color</option>}
          {colors.map((color) => <option key={color.id} value={color.id}>{color.name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium">Price (Ks)</label>
        <input
          type="number"
          step="0.01"
          name="price"
          defaultValue={variant?.price}
          required
          className="mt-1 block w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium">Compare Price (Ks)</label>
        <input
          type="number"
          step="0.01"
          name="compare_price"
          defaultValue={variant?.compare_price ?? ""}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium">Stock Quantity</label>
        <input
          type="number"
          name="stock_quantity"
          defaultValue={variant?.stock_quantity ?? 0}
          required
          className="mt-1 block w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium">Low Stock Threshold</label>
        <input
          type="number"
          name="low_stock_threshold"
          defaultValue={variant?.low_stock_threshold ?? 5}
          required
          className="mt-1 block w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm"
        />
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <input type="checkbox" name="is_active" id={`va-${variant?.id ?? "new"}`} defaultChecked={variant?.is_active ?? true} />
        <label htmlFor={`va-${variant?.id ?? "new"}`} className="text-sm">
          Active
        </label>
      </div>
      {error && <p className="col-span-2 text-sm text-red-500">{error}</p>}
      <div className="col-span-2 flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={onDone} className="rounded-full border border-pink-200 px-4 py-1.5 text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

export function VariantManager({ productId, variants, colors, requiresColor }: { productId: number; variants: Variant[]; colors: { id: number; name: string }[]; requiresColor: boolean }) {
  const [editing, setEditing] = useState<Variant | "new" | null>(null);
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Delete this variant?")) return;
    await deleteVariantAction(id, productId);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {variants.map((variant) =>
        editing !== "new" && editing?.id === variant.id ? (
          <VariantForm key={variant.id} productId={productId} variant={variant} colors={colors} requiresColor={requiresColor} onDone={() => setEditing(null)} />
        ) : (
          <div
            key={variant.id}
            className="flex items-center justify-between rounded-lg border border-pink-100 px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium text-slate-800">{variant.color?.name ? `${variant.color.name} · ` : ""}{variant.variant_name ?? variant.sku}</p>
              <p className="text-slate-500">{variant.sku}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-slate-800">{formatMmk(variant.price)}</p>
              <p className={variant.stock_quantity <= variant.low_stock_threshold ? "text-rose-600" : "text-slate-500"}>
                {variant.stock_quantity} in stock
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(variant)} className="text-primary hover:underline">
                Edit
              </button>
              <button onClick={() => handleDelete(variant.id)} className="text-red-500 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ),
      )}

      {editing === "new" ? (
        <VariantForm productId={productId} colors={colors} requiresColor={requiresColor} onDone={() => setEditing(null)} />
      ) : (
        <button
          onClick={() => setEditing("new")}
          className="rounded-full border border-pink-200 px-4 py-1.5 text-sm font-medium text-primary"
        >
          Add Variant
        </button>
      )}
    </div>
  );
}

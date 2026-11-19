"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCouponAction, updateCouponAction } from "@/lib/actions/admin/coupons";

type Coupon = {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  expires_at: string | null;
  is_active: boolean;
};

export function CouponForm({ coupon, onDone }: { coupon?: Coupon; onDone: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = coupon
        ? await updateCouponAction(coupon.id, formData)
        : await createCouponAction(formData);
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Code</label>
          <input
            type="text"
            name="code"
            defaultValue={coupon?.code}
            required
            className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm uppercase"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Discount Type</label>
          <select
            name="discount_type"
            defaultValue={coupon?.discount_type ?? "percentage"}
            className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed Amount</option>
            <option value="free_shipping">Free Shipping</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Discount Value</label>
          <input
            type="number"
            step="0.01"
            name="discount_value"
            defaultValue={coupon?.discount_value ?? 0}
            required
            className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Min Order Amount</label>
          <input
            type="number"
            step="0.01"
            name="min_order_amount"
            defaultValue={coupon?.min_order_amount ?? 0}
            required
            className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max Discount Amount</label>
          <input
            type="number"
            step="0.01"
            name="max_discount_amount"
            defaultValue={coupon?.max_discount_amount ?? ""}
            className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Usage Limit</label>
          <input
            type="number"
            name="usage_limit"
            defaultValue={coupon?.usage_limit ?? ""}
            className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Expires At</label>
          <input
            type="datetime-local"
            name="expires_at"
            defaultValue={coupon?.expires_at ? coupon.expires_at.slice(0, 16) : ""}
            className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" name="is_active" id="is_active" defaultChecked={coupon?.is_active ?? true} />
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

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/lib/actions/admin/orders";
import { ORDER_STATUS_LABELS } from "@/lib/shop/constants";

export function OrderStatusForm({ orderId, currentStatus }: { orderId: number; currentStatus: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex items-end gap-3">
      <div>
        <label className="text-sm font-medium">Order Status</label>
        <select
          name="order_status"
          defaultValue={currentStatus}
          className="mt-1 block rounded-lg border border-pink-200 px-3 py-2 text-sm"
        >
          {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Update"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
}

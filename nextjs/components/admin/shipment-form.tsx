"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertShipmentAction } from "@/lib/actions/admin/orders";
import { SHIPPING_STATUS_LABELS } from "@/lib/shop/constants";

type Shipment = {
  id: number;
  courier_name: string | null;
  tracking_number: string | null;
  status: string;
};

export function ShipmentForm({ orderId, shipment }: { orderId: number; shipment: Shipment | null }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await upsertShipmentAction(orderId, shipment?.id ?? null, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3 rounded-xl border border-pink-100 bg-white p-4">
      <div>
        <label className="text-sm font-medium">Courier Name</label>
        <input
          name="courier_name"
          defaultValue={shipment?.courier_name ?? ""}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Tracking Number</label>
        <input
          name="tracking_number"
          defaultValue={shipment?.tracking_number ?? ""}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Shipping Status</label>
        <select
          name="status"
          defaultValue={shipment?.status ?? "not_shipped"}
          className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
        >
          {Object.entries(SHIPPING_STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "Saving..." : shipment ? "Update Shipment" : "Create Shipment"}
      </button>
    </form>
  );
}

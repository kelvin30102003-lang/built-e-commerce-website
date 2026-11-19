"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CouponForm } from "./coupon-form";
import { deleteCouponAction } from "@/lib/actions/admin/coupons";
import { formatMmk, formatDateTime } from "@/lib/shop/format";

type Coupon = {
  id: number;
  code: string;
  discount_type: "percentage" | "fixed_amount" | "free_shipping";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
};

const DISCOUNT_LABELS: Record<Coupon["discount_type"], string> = {
  percentage: "Percentage",
  fixed_amount: "Fixed Amount",
  free_shipping: "Free Shipping",
};

function formatDiscount(coupon: Coupon) {
  if (coupon.discount_type === "percentage") return `${coupon.discount_value}%`;
  if (coupon.discount_type === "fixed_amount") return formatMmk(coupon.discount_value);
  return "Free Shipping";
}

export function CouponList({ coupons }: { coupons: Coupon[] }) {
  const [editing, setEditing] = useState<Coupon | "new" | null>(null);
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Delete this coupon?")) return;
    await deleteCouponAction(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <CouponForm onDone={() => setEditing(null)} />
      ) : (
        <button
          onClick={() => setEditing("new")}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add Coupon
        </button>
      )}

      <div className="overflow-x-auto rounded-xl border border-pink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Code</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Discount</th>
              <th className="px-4 py-2">Min Order</th>
              <th className="px-4 py-2">Usage</th>
              <th className="px-4 py-2">Expires</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {coupons.map((coupon) =>
              editing !== "new" && editing?.id === coupon.id ? (
                <tr key={coupon.id}>
                  <td colSpan={8} className="p-2">
                    <CouponForm coupon={coupon} onDone={() => setEditing(null)} />
                  </td>
                </tr>
              ) : (
                <tr key={coupon.id}>
                  <td className="px-4 py-2 font-medium text-slate-800">{coupon.code}</td>
                  <td className="px-4 py-2">{DISCOUNT_LABELS[coupon.discount_type]}</td>
                  <td className="px-4 py-2">{formatDiscount(coupon)}</td>
                  <td className="px-4 py-2">{formatMmk(coupon.min_order_amount)}</td>
                  <td className="px-4 py-2">
                    {coupon.used_count}
                    {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                  </td>
                  <td className="px-4 py-2">{coupon.expires_at ? formatDateTime(coupon.expires_at) : "—"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        coupon.is_active
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                          : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                      }
                    >
                      {coupon.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button onClick={() => setEditing(coupon)} className="mr-3 text-primary hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="p-4 text-sm text-slate-500">No coupons yet.</p>}
      </div>
    </div>
  );
}

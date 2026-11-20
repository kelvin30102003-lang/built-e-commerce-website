import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMmk, formatDateTime } from "@/lib/shop/format";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/shop/constants";
import type { OrderStatus } from "@/lib/types/database";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminCapability("orders");
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, order_number, total_amount, order_status, payment_status, placed_at")
    .order("placed_at", { ascending: false })
    .limit(100);

  if (status && status in ORDER_STATUS_LABELS) {
    query = query.eq("order_status", status as OrderStatus);
  }

  const { data: orders, error } = await query;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>

      <div className="flex gap-2 text-sm">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1 ${!status ? "bg-primary text-primary-foreground" : "border border-pink-200"}`}
        >
          All
        </Link>
        {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/orders?status=${key}`}
            className={`rounded-full px-3 py-1 ${status === key ? "bg-primary text-primary-foreground" : "border border-pink-200"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-pink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Order #</th>
              <th className="px-4 py-2">Placed</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {(orders ?? []).map((order) => (
              <tr key={order.id}>
                <td className="px-4 py-2 font-medium text-slate-800">{order.order_number}</td>
                <td className="px-4 py-2 text-slate-500">{formatDateTime(order.placed_at)}</td>
                <td className="px-4 py-2 text-slate-500">{formatMmk(order.total_amount)}</td>
                <td className="px-4 py-2 text-slate-500">
                  {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-primary hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(orders ?? []).length === 0 && <p className="p-4 text-sm text-slate-500">No orders found.</p>}
      </div>
    </div>
  );
}

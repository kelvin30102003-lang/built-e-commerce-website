import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/shop/format";
import { SHIPPING_STATUS_LABELS } from "@/lib/shop/constants";

export default async function AdminShipmentsPage() {
  const supabase = await createClient();
  const { data: shipments } = await supabase
    .from("shipments")
    .select("id, order_id, courier_name, tracking_number, status, shipped_at, orders(order_number)")
    .order("id", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Shipments</h1>

      <div className="overflow-hidden rounded-xl border border-pink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Courier</th>
              <th className="px-4 py-2">Tracking #</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Shipped</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {(shipments ?? []).map((shipment) => (
              <tr key={shipment.id}>
                <td className="px-4 py-2 font-medium text-slate-800">{shipment.orders?.order_number}</td>
                <td className="px-4 py-2 text-slate-500">{shipment.courier_name ?? "—"}</td>
                <td className="px-4 py-2 text-slate-500">{shipment.tracking_number ?? "—"}</td>
                <td className="px-4 py-2 text-slate-500">
                  {SHIPPING_STATUS_LABELS[shipment.status] ?? shipment.status}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {shipment.shipped_at ? formatDateTime(shipment.shipped_at) : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/admin/orders/${shipment.order_id}`} className="text-primary hover:underline">
                    View Order
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(shipments ?? []).length === 0 && <p className="p-4 text-sm text-slate-500">No shipments yet.</p>}
      </div>
    </div>
  );
}

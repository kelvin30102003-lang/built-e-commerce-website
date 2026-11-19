import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMmk, formatDateTime } from "@/lib/shop/format";
import { PAYMENT_STATUS_LABELS } from "@/lib/shop/constants";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { ShipmentForm } from "@/components/admin/shipment-form";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);
  const supabase = await createClient();

  const [{ data: order }, { data: items }, { data: shipment }, { data: slips }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", orderId).single(),
    supabase.from("order_items").select("*").eq("order_id", orderId),
    supabase.from("shipments").select("id, courier_name, tracking_number, status").eq("order_id", orderId).maybeSingle(),
    supabase.from("payment_slips").select("id, status, amount, slip_image_path").eq("order_id", orderId),
  ]);

  if (!order) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Order {order.order_number}</h1>
        <p className="text-sm text-slate-500">Placed {formatDateTime(order.placed_at)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-pink-100 bg-white p-4">
            <h2 className="mb-3 font-semibold text-slate-900">Status</h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.order_status} />
            <p className="mt-3 text-sm text-slate-500">
              Payment: {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
            </p>
          </div>

          <div>
            <h2 className="mb-3 font-semibold text-slate-900">Shipment</h2>
            <ShipmentForm orderId={order.id} shipment={shipment ?? null} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-pink-100 bg-white p-4">
            <h2 className="mb-3 font-semibold text-slate-900">Items</h2>
            <ul className="divide-y divide-pink-50 text-sm">
              {(items ?? []).map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-slate-800">{item.product_name}</p>
                    <p className="text-slate-500">
                      {item.variant_name ?? item.sku} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-slate-800">{formatMmk(item.total_price)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t border-pink-50 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>{formatMmk(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span>{formatMmk(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Total</span>
                <span>{formatMmk(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {(slips ?? []).length > 0 && (
            <div className="rounded-xl border border-pink-100 bg-white p-4">
              <h2 className="mb-3 font-semibold text-slate-900">Payment Slips</h2>
              <ul className="space-y-1 text-sm">
                {(slips ?? []).map((slip) => (
                  <li key={slip.id} className="flex justify-between">
                    <span>{formatMmk(slip.amount)}</span>
                    <span className="capitalize text-slate-500">{slip.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

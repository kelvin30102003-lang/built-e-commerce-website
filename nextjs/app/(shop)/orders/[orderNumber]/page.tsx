import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMmk, formatDateTime } from "@/lib/shop/format";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, SHIPPING_STATUS_LABELS } from "@/lib/shop/constants";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/orders/${orderNumber}`);

  const { data: order } = await supabase
    .from("orders")
    .select(
      `id, order_number, subtotal, shipping_fee, total_amount, order_status, payment_status, shipping_status,
       payment_method, placed_at,
       order_items(id, product_name, variant_name, quantity, unit_price, total_price),
       shipments(tracking_number, courier_name, status)`,
    )
    .eq("order_number", orderNumber)
    .single();

  if (!order) notFound();

  const shipment = Array.isArray(order.shipments) ? order.shipments[0] : order.shipments;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="border-b border-surface-dim pb-6">
        <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground">
          Order {order.order_number}
        </h1>
        <p className="mt-1 text-sm text-secondary">Placed {formatDateTime(order.placed_at)}</p>
      </div>

      <div className="mt-6 grid gap-px bg-surface-dim shadow-sm sm:grid-cols-3">
        <StatusCard label="Order Status" value={ORDER_STATUS_LABELS[order.order_status] ?? order.order_status} />
        <StatusCard label="Payment" value={PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status} />
        <StatusCard
          label="Shipping"
          value={SHIPPING_STATUS_LABELS[order.shipping_status] ?? order.shipping_status}
        />
      </div>

      {shipment?.tracking_number && (
        <p className="mt-4 text-sm text-secondary">
          Tracking: <strong className="text-foreground">{shipment.tracking_number}</strong> ({shipment.courier_name})
        </p>
      )}

      <div className="mt-8 bg-surface-lowest p-6 shadow-sm">
        <h2 className="text-[11px] font-semibold uppercase tracking-label text-secondary">Items</h2>
        <div className="mt-4 flex flex-col divide-y divide-surface-dim">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-foreground">{item.product_name}</p>
                {item.variant_name && <p className="text-secondary">{item.variant_name}</p>}
                <p className="text-secondary">Qty {item.quantity}</p>
              </div>
              <p className="font-medium text-foreground">{formatMmk(item.total_price)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-1 border-t border-surface-dim pt-4 text-sm text-on-surface-variant">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-foreground">{formatMmk(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-medium text-foreground">{formatMmk(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between border-t border-surface-dim pt-2 font-semibold text-foreground">
            <span>Total</span>
            <span>{formatMmk(order.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-lowest p-4">
      <p className="text-[11px] font-semibold uppercase tracking-label text-secondary">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}

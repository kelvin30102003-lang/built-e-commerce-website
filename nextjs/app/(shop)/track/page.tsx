import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { formatDate, formatMmk } from "@/lib/shop/format";
import { ORDER_STATUS_LABELS } from "@/lib/shop/constants";

const TRACKING_STEPS = [
  { status: "pending", label: "Order Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "processing", label: "Preparing" },
  { status: "shipped", label: "In Transit" },
  { status: "delivered", label: "Delivered" },
];

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const { orderNumber } = await searchParams;
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=${encodeURIComponent(orderNumber ? `/track?orderNumber=${orderNumber}` : "/track")}`);

  const normalizedOrderNumber = orderNumber?.trim();
  const orderResult = normalizedOrderNumber
    ? await supabase
        .from("orders")
        .select("order_number, order_status, placed_at, total_amount, order_items(quantity), shipments(tracking_number, courier_name)")
        .eq("user_id", user.id)
        .eq("order_number", normalizedOrderNumber)
        .maybeSingle()
    : null;
  const order = orderResult?.data ?? null;

  const isTerminal = order?.order_status === "cancelled" || order?.order_status === "refunded";
  const activeStep = order ? TRACKING_STEPS.findIndex((step) => step.status === order.order_status) : -1;
  const currentStep = order
    ? Math.max(activeStep, order.order_status === "processing" ? 2 : order.order_status === "shipped" ? 3 : 0)
    : -1;
  const shipment = order && Array.isArray(order.shipments) ? order.shipments[0] : order?.shipments;
  const itemCount = order?.order_items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Order Tracking</h1>
        <p className="mt-3 text-sm leading-6 text-secondary">
          Enter one of your order numbers to see its latest status and delivery progress.
        </p>
      </header>

      <form method="get" className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="orderNumber">Order number</label>
        <input
          id="orderNumber"
          name="orderNumber"
          required
          defaultValue={normalizedOrderNumber}
          placeholder="Enter order number"
          className="min-w-0 flex-1 rounded-lg border border-surface-dim bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
        />
        <button type="submit" className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Track order
        </button>
      </form>

      {normalizedOrderNumber && orderResult?.error && (
        <p role="alert" className="mx-auto mt-5 max-w-xl rounded-lg bg-surface-low p-4 text-sm text-secondary">
          We could not load this order. Please refresh and try again.
        </p>
      )}

      {normalizedOrderNumber && !order && !orderResult?.error && (
        <p role="status" className="mx-auto mt-5 max-w-xl rounded-lg bg-surface-low p-4 text-sm text-secondary">
          We couldn’t find that order in your account. Check the order number and try again.
        </p>
      )}

      {order && (
        <section className="mt-10 rounded-xl border border-surface-dim bg-white p-5 sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-surface-dim pb-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">Order details</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{order.order_number}</h2>
              <p className="mt-1 text-sm text-secondary">Placed {formatDate(order.placed_at)}</p>
            </div>
            <p className="w-fit rounded-full bg-surface-low px-4 py-2 text-sm font-semibold text-foreground">
              {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
            </p>
          </div>

          {isTerminal ? (
            <p className="mt-6 text-sm text-secondary">This order is {order.order_status} and has no further delivery updates.</p>
          ) : (
            <div className="mt-8">
              <h3 className="text-base font-semibold text-foreground">Order progress</h3>
              <ol className="mt-6 grid grid-cols-2 gap-y-7 sm:grid-cols-5">
                {TRACKING_STEPS.map((step, index) => {
                  const complete = index <= currentStep;
                  return (
                    <li key={step.status} className="relative flex flex-col items-center text-center">
                      {index < TRACKING_STEPS.length - 1 && (
                        <span className={`absolute left-1/2 top-4 hidden h-px w-full sm:block ${index < currentStep ? "bg-primary" : "bg-surface-dim"}`} />
                      )}
                      <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${complete ? "border-primary bg-primary text-primary-foreground" : "border-surface-dim bg-white text-secondary"}`}>
                        {index + 1}
                      </span>
                      <span className={`mt-2 text-xs font-medium ${complete ? "text-foreground" : "text-secondary"}`}>{step.label}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          <div className="mt-8 grid gap-4 border-t border-surface-dim pt-5 text-sm sm:grid-cols-3">
            <div><p className="text-secondary">Items</p><p className="mt-1 font-medium text-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</p></div>
            <div><p className="text-secondary">Total</p><p className="mt-1 font-medium text-foreground">{formatMmk(order.total_amount)}</p></div>
            {shipment?.tracking_number && <div><p className="text-secondary">Shipment tracking</p><p className="mt-1 font-medium text-foreground">{shipment.tracking_number}{shipment.courier_name ? ` · ${shipment.courier_name}` : ""}</p></div>}
          </div>
          <Link href={`/orders/${order.order_number}`} className="mt-6 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
            View full order details
          </Link>
        </section>
      )}

      <p className="mt-8 text-center text-sm text-secondary">
        Looking for past purchases? <Link href="/orders" className="font-medium text-primary underline-offset-4 hover:underline">View order history</Link>
      </p>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatMmk } from "@/lib/shop/format";
import { ORDER_STATUS_LABELS } from "@/lib/shop/constants";

export default async function OrderHistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select("order_number, total_amount, order_status, placed_at, order_items(quantity)")
    .eq("user_id", user.id)
    .order("placed_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-surface-dim pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-secondary">Your account</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Order History</h1>
          <p className="mt-2 text-sm text-secondary">Review your past purchases and open their tracking details.</p>
        </div>
        <Link href="/track" className="text-sm font-semibold text-primary underline-offset-4 hover:underline">Track an order</Link>
      </header>

      {!orders?.length ? (
        <section className="rounded-xl border border-surface-dim bg-white px-6 py-12 text-center">
          <h2 className="text-lg font-semibold text-foreground">No orders yet</h2>
          <p className="mt-2 text-sm text-secondary">Your purchases will appear here after checkout.</p>
          <Link href="/shop" className="mt-5 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Explore the shop</Link>
        </section>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const itemCount = order.order_items.reduce((total, item) => total + item.quantity, 0);
            return (
              <Link
                key={order.order_number}
                href={`/orders/${order.order_number}`}
                className="flex flex-col gap-4 rounded-xl border border-surface-dim bg-white p-5 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-secondary">Order number</p>
                  <h2 className="mt-1 font-semibold text-foreground">{order.order_number}</h2>
                  <p className="mt-1 text-sm text-secondary">{formatDate(order.placed_at)} · {itemCount} {itemCount === 1 ? "item" : "items"}</p>
                </div>
                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div className="sm:text-right">
                    <p className="font-semibold text-foreground">{formatMmk(order.total_amount)}</p>
                    <p className="mt-1 text-sm text-secondary">{ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}</p>
                  </div>
                  <span aria-hidden="true" className="text-lg text-secondary">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}

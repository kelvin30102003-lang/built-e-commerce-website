import { requireStaffOrAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatDateTime } from "@/lib/shop/format";
import Link from "next/link";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  href: string;
}

async function fetchNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();

  const [{ data: slips }, { data: orders }] = await Promise.all([
    supabase
      .from("payment_slips")
      .select("id, created_at, orders(order_number)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("orders")
      .select("id, order_number, created_at")
      .eq("order_status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const items: NotificationItem[] = [];

  for (const slip of slips ?? []) {
    const orderNumber = (slip.orders as { order_number: string } | null)?.order_number;
    items.push({
      id: `slip-${slip.id}`,
      title: "Payment slip awaiting review",
      description: orderNumber ? `Order ${orderNumber}` : `Slip #${slip.id}`,
      created_at: slip.created_at,
      href: `/admin/payment-slips/${slip.id}`,
    });
  }

  for (const order of orders ?? []) {
    items.push({
      id: `order-${order.id}`,
      title: "New order placed",
      description: `Order ${order.order_number}`,
      created_at: order.created_at,
      href: `/admin/orders/${order.id}`,
    });
  }

  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default async function AdminNotificationsPage() {
  await requireStaffOrAdmin();

  const notifications = await fetchNotifications();

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Notifications</h1>

      {notifications.length === 0 ? (
        <EmptyState message="No pending notifications." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-dim bg-surface-lowest">
          <ul className="divide-y divide-surface-dim">
            {notifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className="flex items-center justify-between px-4 py-3 hover:bg-surface-container"
                >
                  <div>
                    <p className="font-medium text-primary">{n.title}</p>
                    <p className="text-sm text-secondary">{n.description}</p>
                  </div>
                  <div className="text-xs text-secondary">{formatDateTime(n.created_at)}</div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

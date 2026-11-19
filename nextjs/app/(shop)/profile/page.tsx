import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMmk, formatDate } from "@/lib/shop/format";
import { ORDER_STATUS_LABELS } from "@/lib/shop/constants";
import { LogoutButton } from "@/components/shop/logout-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/profile");

  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, avatar_url").eq("id", user.id).single(),
    supabase
      .from("orders")
      .select("order_number, total_amount, order_status, placed_at")
      .eq("user_id", user.id)
      .order("placed_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between border-b border-surface-dim pb-6">
        <div>
          <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground">
            {profile?.full_name || "My Profile"}
          </h1>
          <p className="text-sm text-secondary">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <section className="mt-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-label text-secondary">Order History</h2>
        {!orders || orders.length === 0 ? (
          <p className="mt-4 text-secondary">You haven&apos;t placed any orders yet.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-px bg-surface-lowest shadow-sm">
            {orders.map((order) => (
              <Link
                key={order.order_number}
                href={`/orders/${order.order_number}`}
                className="flex items-center justify-between p-4 transition-colors hover:bg-surface-low"
              >
                <div>
                  <p className="font-medium text-foreground">{order.order_number}</p>
                  <p className="text-sm text-secondary">{formatDate(order.placed_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{formatMmk(order.total_amount)}</p>
                  <p className="text-sm text-secondary">
                    {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

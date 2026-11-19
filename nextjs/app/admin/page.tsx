import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardMetrics } from "@/lib/admin/dashboard";
import { formatMmk, formatDateTime } from "@/lib/shop/format";
import { ORDER_STATUS_LABELS } from "@/lib/shop/constants";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const metrics = await fetchDashboardMetrics(supabase);

  const cards = [
    { label: "Total Sales", value: formatMmk(metrics.totalSales) },
    { label: "Today's Sales", value: formatMmk(metrics.todaySales) },
    { label: "Total Orders", value: metrics.totalOrders },
    { label: "Orders Today", value: metrics.todayOrders },
    { label: "Pending Orders", value: metrics.pendingOrders },
    { label: "Customers", value: metrics.totalCustomers },
    { label: "Active Products", value: metrics.activeProducts },
    { label: "Low Stock Items", value: metrics.lowStockCount },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-pink-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-pink-600 hover:underline">
              View all
            </Link>
          </div>
          {metrics.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">No orders yet.</p>
          ) : (
            <ul className="divide-y divide-pink-50">
              {metrics.recentOrders.map((order) => (
                <li key={order.order_number} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{order.order_number}</p>
                    <p className="text-slate-500">{formatDateTime(order.placed_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-800">{formatMmk(order.total_amount)}</p>
                    <p className="text-slate-500">
                      {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Low Stock</h2>
            <Link href="/admin/products" className="text-sm text-pink-600 hover:underline">
              Manage products
            </Link>
          </div>
          {metrics.lowStockVariants.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing running low.</p>
          ) : (
            <ul className="divide-y divide-pink-50">
              {metrics.lowStockVariants.map((variant) => (
                <li key={variant.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{variant.variant_name}</p>
                    <p className="text-slate-500">{variant.sku}</p>
                  </div>
                  <p className="font-medium text-rose-600">{variant.stock_quantity} left</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

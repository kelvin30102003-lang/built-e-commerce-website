import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardMetrics } from "@/lib/admin/dashboard";
import { formatMmk, formatDateTime } from "@/lib/shop/format";
import { ORDER_STATUS_LABELS } from "@/lib/shop/constants";
import { requireStaffOrAdmin } from "@/lib/auth/require-admin";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

const statusStyles: Record<string, string> = {
  pending: "bg-slate-900 text-white",
  confirmed: "bg-slate-100 text-slate-700",
  processing: "bg-slate-200 text-slate-800",
  shipped: "bg-slate-300 text-slate-800",
  delivered: "bg-slate-800 text-white",
  cancelled: "bg-slate-100 text-slate-500",
  refunded: "bg-slate-100 text-slate-600",
};

export default async function AdminDashboardPage() {
  const { profile: adminProfile } = await requireStaffOrAdmin();
  const supabase = await createClient();
  const metrics = await fetchDashboardMetrics(supabase);
  const canManageOrders = adminProfile.role === "admin" || adminProfile.can_manage_orders;
  const canManageProducts = adminProfile.role === "admin" || adminProfile.can_manage_products;

  const primaryCards = [
    { label: "Total sales", value: formatMmk(metrics.totalSales), note: "Paid orders", mark: "MMK", tone: "text-white bg-slate-900" },
    { label: "Sales today", value: formatMmk(metrics.todaySales), note: `${metrics.todayOrders} orders placed today`, mark: "TODAY", tone: "text-slate-700 bg-slate-100" },
    { label: "Pending orders", value: metrics.pendingOrders, note: "Need order status updates", mark: "OPEN", tone: "text-slate-700 bg-slate-200" },
    { label: "Low stock", value: metrics.lowStockCount, note: "At or below the configured threshold", mark: "STOCK", tone: "text-white bg-slate-700" },
  ];

  const secondaryStats = [
    { label: "Total orders", value: metrics.totalOrders },
    { label: "Customers", value: metrics.totalCustomers },
    { label: "Active products", value: metrics.activeProducts },
    { label: "Orders today", value: metrics.todayOrders },
  ];

  return (
    <div className="-m-6 min-h-screen space-y-7 bg-[#f5f6fa] p-4 sm:space-y-8 sm:p-6 lg:p-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {canManageOrders && (
            <Link href="/admin/orders?status=pending" className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              Review pending orders
            </Link>
          )}
          {canManageProducts && (
            <Link href="/admin/products/new" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:border-black hover:bg-slate-50">
              Add product
            </Link>
          )}
        </div>
      </section>

      <section aria-labelledby="overview-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="overview-heading" className="text-base font-semibold text-slate-800">Overview</h2>
          <span className="text-xs text-slate-400">Live store totals</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {primaryCards.map((card) => (
            <article key={card.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(30,41,59,0.03)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{card.value}</p>
                </div>
                <span className={`rounded-lg px-2 py-1 text-[9px] font-bold tracking-wide ${card.tone}`}>{card.mark}</span>
              </div>
              <p className="mt-3 text-xs text-slate-400">{card.note}</p>
            </article>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 divide-x divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/80 bg-white sm:grid-cols-4">
          {secondaryStats.map((stat) => (
            <div key={stat.label} className="px-4 py-4 sm:px-5">
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <DashboardCharts
        salesByDay={metrics.salesByDay}
        orderStatusCounts={metrics.orderStatusCounts}
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(30,41,59,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-slate-900">Recent orders</h2>
              <p className="mt-0.5 text-xs text-slate-400">Latest activity from your customers</p>
            </div>
            <Link href="/admin/orders" className="text-sm font-semibold text-slate-700 hover:text-black">View all</Link>
          </div>
          {metrics.recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium text-slate-700">No orders yet</p>
              <p className="mt-1 text-sm text-slate-400">New customer orders will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold sm:px-6">Order</th>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold sm:px-6">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.recentOrders.map((order) => (
                    <tr key={order.order_number} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-5 py-4 font-semibold text-slate-800 sm:px-6">
                        <Link href={`/admin/orders/${order.id}`} className="hover:text-black">{order.order_number}</Link>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">{formatDateTime(order.placed_at)}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[order.order_status] ?? "bg-slate-100 text-slate-600"}`}>
                          {ORDER_STATUS_LABELS[order.order_status] ?? order.order_status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-slate-800 sm:px-6">{formatMmk(order.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(30,41,59,0.03)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Low stock</h2>
              <p className="mt-0.5 text-xs text-slate-400">Variants that may need restocking</p>
            </div>
            <Link href="/admin/products" className="text-sm font-semibold text-slate-700 hover:text-black">Manage</Link>
          </div>
          {metrics.lowStockVariants.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="font-medium text-slate-700">Stock looks good</p>
              <p className="mt-1 text-sm text-slate-400">No active variants are at the low-stock mark.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {metrics.lowStockVariants.slice(0, 6).map((variant) => (
                <li key={variant.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{variant.variant_name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{variant.sku}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${variant.stock_quantity === 0 ? "bg-black text-white" : "bg-slate-100 text-slate-700"}`}>
                    {variant.stock_quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

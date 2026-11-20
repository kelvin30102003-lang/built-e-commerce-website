import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, OrderStatus } from "@/lib/types/database";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

type DashboardRpcRow = {
  total_orders: number;
  today_orders: number;
  pending_orders: number;
  total_customers: number;
  active_products: number;
  low_stock_count: number;
  total_sales: number;
  today_sales: number;
  sales_by_day: { total: number }[];
  order_status_counts: { status: string; count: number }[];
  low_stock_variants: {
    id: number;
    sku: string;
    variant_name: string | null;
    stock_quantity: number;
  }[];
  recent_orders: {
    id: number;
    order_number: string;
    total_amount: number;
    order_status: OrderStatus;
    placed_at: string;
  }[];
};

export async function fetchDashboardMetrics(supabase: SupabaseClient<Database>) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const salesDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startOfToday);
    date.setDate(date.getDate() - 6 + index);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      start: date.toISOString(),
    };
  });

  const { data, error } = await supabase.rpc("admin_dashboard_metrics", {
    p_start_of_today: startOfToday.toISOString(),
    p_start_of_tomorrow: startOfTomorrow.toISOString(),
    p_day_starts: salesDays.map((day) => day.start),
  });

  if (error) throw new Error(`Could not load dashboard metrics: ${error.message}`);
  const metrics = (data?.[0] as DashboardRpcRow | undefined);
  if (!metrics) throw new Error("Dashboard metrics are unavailable for this account.");

  return {
    totalOrders: metrics.total_orders,
    todayOrders: metrics.today_orders,
    pendingOrders: metrics.pending_orders,
    totalCustomers: metrics.total_customers,
    totalSales: Number(metrics.total_sales),
    todaySales: Number(metrics.today_sales),
    lowStockVariants: metrics.low_stock_variants ?? [],
    lowStockCount: metrics.low_stock_count,
    activeProducts: metrics.active_products,
    recentOrders: metrics.recent_orders ?? [],
    salesByDay: salesDays.map((day, index) => ({
      key: day.key,
      label: day.label,
      total: Number(metrics.sales_by_day?.[index]?.total ?? 0),
    })),
    orderStatusCounts: ORDER_STATUSES.map((status) => ({
      status,
      count: Number(metrics.order_status_counts?.find((item) => item.status === status)?.count ?? 0),
    })),
  };
}

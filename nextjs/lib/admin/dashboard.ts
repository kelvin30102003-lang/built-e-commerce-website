import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export async function fetchDashboardMetrics(supabase: SupabaseClient<Database>) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    { count: totalOrders },
    { count: todayOrders },
    { count: pendingOrders },
    { count: totalCustomers },
    { data: revenueRows },
    { data: lowStockVariants, count: lowStockCount },
    { count: activeProducts },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).gte("placed_at", startOfToday.toISOString()),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("order_status", "pending"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("orders").select("total_amount, placed_at").neq("payment_status", "unpaid"),
    supabase
      .from("product_variants")
      .select("id, sku, variant_name, stock_quantity, low_stock_threshold", { count: "exact" })
      .lte("stock_quantity", 5)
      .eq("is_active", true),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase
      .from("orders")
      .select("order_number, total_amount, order_status, placed_at")
      .order("placed_at", { ascending: false })
      .limit(5),
  ]);

  const totalSales = (revenueRows ?? []).reduce((sum, row) => sum + row.total_amount, 0);
  const todaySales = (revenueRows ?? [])
    .filter((row) => new Date(row.placed_at) >= startOfToday)
    .reduce((sum, row) => sum + row.total_amount, 0);

  return {
    totalOrders: totalOrders ?? 0,
    todayOrders: todayOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    totalCustomers: totalCustomers ?? 0,
    totalSales,
    todaySales,
    lowStockVariants: lowStockVariants ?? [],
    lowStockCount: lowStockCount ?? 0,
    activeProducts: activeProducts ?? 0,
    recentOrders: recentOrders ?? [],
  };
}

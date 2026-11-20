import { createClient } from "@/lib/supabase/server";
import { CouponList } from "@/components/admin/coupon-list";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

export default async function AdminCouponsPage() {
  await requireAdminCapability("coupons");
  const supabase = await createClient();
  const { data: coupons, error } = await supabase
    .from("coupons")
    .select(
      "id, code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, used_count, expires_at, is_active"
    )
    .order("created_at", { ascending: false });
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Coupons</h1>
      <CouponList coupons={coupons ?? []} />
    </div>
  );
}

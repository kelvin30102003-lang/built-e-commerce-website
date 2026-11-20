import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatMmk, formatDateTime } from "@/lib/shop/format";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function AdminPaymentSlipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdminCapability("orders");
  const { status } = await searchParams;
  const activeStatus = status ?? "pending";
  const supabase = await createClient();

  let query = supabase
    .from("payment_slips")
    .select("id, amount, transaction_id, status, created_at, orders(order_number), payment_methods(name)")
    .order("created_at", { ascending: false });

  if (activeStatus === "pending" || activeStatus === "approved" || activeStatus === "rejected") {
    query = query.eq("status", activeStatus);
  }

  const { data: slips, error } = await query.limit(100);
  if (error) return <ErrorMessage error={error} />;

  const tabs = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Payment Slips</h1>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/payment-slips?status=${tab.key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              activeStatus === tab.key ? "bg-primary text-primary-foreground" : "bg-pink-50 text-slate-600"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-pink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {slips?.map((slip) => (
              <tr key={slip.id} className="border-t border-pink-50">
                <td className="px-4 py-3 font-medium">{slip.orders?.order_number}</td>
                <td className="px-4 py-3">{slip.payment_methods?.name}</td>
                <td className="px-4 py-3">{formatMmk(slip.amount)}</td>
                <td className="px-4 py-3">{slip.transaction_id ?? "—"}</td>
                <td className="px-4 py-3">{formatDateTime(slip.created_at)}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[slip.status]}`}>
                    {slip.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/payment-slips/${slip.id}`} className="text-primary hover:underline">
                    Review
                  </Link>
                </td>
              </tr>
            ))}
            {!slips?.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No payment slips found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

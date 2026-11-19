import { createClient } from "@/lib/supabase/server";
import { formatMmk, formatDateTime } from "@/lib/shop/format";

export default async function AdminPaymentsPage() {
  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, payment_method, transaction_id, amount, status, paid_at, orders(order_number)")
    .order("id", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>

      <div className="overflow-hidden rounded-xl border border-pink-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-pink-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Method</th>
              <th className="px-4 py-2">Transaction ID</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Paid At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pink-50">
            {(payments ?? []).map((payment) => (
              <tr key={payment.id}>
                <td className="px-4 py-2 font-medium text-slate-800">{payment.orders?.order_number}</td>
                <td className="px-4 py-2 text-slate-500">{payment.payment_method}</td>
                <td className="px-4 py-2 text-slate-500">{payment.transaction_id ?? "—"}</td>
                <td className="px-4 py-2 text-slate-500">{formatMmk(payment.amount)}</td>
                <td className="px-4 py-2 capitalize text-slate-500">{payment.status}</td>
                <td className="px-4 py-2 text-slate-500">
                  {payment.paid_at ? formatDateTime(payment.paid_at) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(payments ?? []).length === 0 && <p className="p-4 text-sm text-slate-500">No payments yet.</p>}
      </div>
    </div>
  );
}

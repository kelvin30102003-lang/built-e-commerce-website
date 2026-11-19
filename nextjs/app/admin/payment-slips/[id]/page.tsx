import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PaymentSlipReview } from "@/components/admin/payment-slip-review";

export default async function AdminPaymentSlipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: slip } = await supabase
    .from("payment_slips")
    .select(
      "id, amount, transaction_id, sender_name, sender_phone, status, admin_note, reject_reason, slip_image_path, orders(order_number), payment_methods(name)"
    )
    .eq("id", Number(id))
    .maybeSingle();

  if (!slip) notFound();

  let slipImageUrl: string | null = null;
  if (slip.slip_image_path) {
    const { data: signed } = await supabase.storage
      .from("payment-slips")
      .createSignedUrl(slip.slip_image_path, 60 * 10);
    slipImageUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Review Payment Slip</h1>
        <Link href="/admin/payment-slips" className="text-sm text-primary hover:underline">
          ← Back to list
        </Link>
      </div>

      {slip.status !== "pending" ? (
        <div className="rounded-xl border border-pink-100 bg-white p-4 text-sm">
          <p>
            This slip was already <span className="font-semibold">{slip.status}</span>.
          </p>
          {slip.admin_note && <p className="mt-2 text-slate-500">Admin note: {slip.admin_note}</p>}
          {slip.reject_reason && <p className="mt-2 text-slate-500">Reject reason: {slip.reject_reason}</p>}
        </div>
      ) : (
        <PaymentSlipReview
          slip={{
            id: slip.id,
            amount: slip.amount,
            transaction_id: slip.transaction_id,
            sender_name: slip.sender_name,
            sender_phone: slip.sender_phone,
            slip_image_url: slipImageUrl,
            order_number: slip.orders?.order_number ?? "",
            payment_method_name: slip.payment_methods?.name ?? "",
          }}
        />
      )}
    </div>
  );
}

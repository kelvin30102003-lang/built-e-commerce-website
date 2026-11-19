"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approvePaymentSlipAction, rejectPaymentSlipAction } from "@/lib/actions/admin/payment-slips";
import { formatMmk } from "@/lib/shop/format";

type Slip = {
  id: number;
  amount: number;
  transaction_id: string | null;
  slip_image_url: string | null;
  sender_name: string | null;
  sender_phone: string | null;
  order_number: string;
  payment_method_name: string;
};

export function PaymentSlipReview({ slip }: { slip: Slip }) {
  const [adminNote, setAdminNote] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove() {
    startTransition(async () => {
      const result = await approvePaymentSlipAction(slip.id, adminNote);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function handleReject() {
    if (!rejectReason.trim()) {
      setError("Reject reason is required.");
      return;
    }
    startTransition(async () => {
      const result = await rejectPaymentSlipAction(slip.id, rejectReason, adminNote);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="rounded-xl border border-pink-100 bg-white p-4 lg:col-span-7">
        {slip.slip_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slip.slip_image_url} alt="Payment slip" className="max-h-[600px] w-full rounded-lg object-contain bg-slate-50" />
        ) : (
          <p className="text-sm text-slate-500">No image available.</p>
        )}
      </div>

      <div className="space-y-4 lg:col-span-5">
        <div className="rounded-xl border border-pink-100 bg-white p-4 text-sm">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-slate-500">Order</dt>
              <dd className="font-semibold">{slip.order_number}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Method</dt>
              <dd className="font-semibold">{slip.payment_method_name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Amount</dt>
              <dd className="font-semibold">{formatMmk(slip.amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Transaction ID</dt>
              <dd className="font-semibold">{slip.transaction_id ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Sender</dt>
              <dd className="font-semibold">{slip.sender_name ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Sender Phone</dt>
              <dd className="font-semibold">{slip.sender_phone ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="space-y-3 rounded-xl border border-pink-100 bg-white p-4">
          <div>
            <label className="text-sm font-medium">Admin Note (optional)</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="w-full rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Approve Payment
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-pink-100 bg-white p-4">
          <div>
            <label className="text-sm font-medium">Reject Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-pink-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={handleReject}
            disabled={isPending}
            className="w-full rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Reject Slip
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}

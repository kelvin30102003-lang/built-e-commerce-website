"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminCapability } from "@/lib/auth/require-admin";

export async function approvePaymentSlipAction(slipId: number, adminNote: string) {
  await requireAdminCapability("orders");
  if (!Number.isSafeInteger(slipId) || slipId <= 0 || typeof adminNote !== "string" || adminNote.length > 1000) {
    return { error: "Invalid payment slip review." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_payment_slip", {
    p_slip_id: slipId,
    p_admin_note: adminNote || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/payment-slips");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  return { success: true };
}

export async function rejectPaymentSlipAction(slipId: number, reason: string, adminNote: string) {
  await requireAdminCapability("orders");
  if (!Number.isSafeInteger(slipId) || slipId <= 0 || typeof reason !== "string" || reason.trim().length < 1 || reason.length > 1000 || typeof adminNote !== "string" || adminNote.length > 1000) {
    return { error: "Enter a valid rejection reason." };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_payment_slip", {
    p_slip_id: slipId,
    p_reject_reason: reason,
    p_admin_note: adminNote || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/payment-slips");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/payments");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminCapability } from "@/lib/auth/require-admin";

const orderStatusSchema = z.object({
  order_status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
});

export async function updateOrderStatusAction(id: number, formData: FormData) {
  await requireAdminCapability("orders");
  const parsed = orderStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ order_status: parsed.data.order_status })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/track");
  revalidatePath("/orders/[orderNumber]", "page");
  return { success: true };
}

const shipmentSchema = z.object({
  courier_name: z.string().trim().max(120).optional(),
  tracking_number: z.string().trim().max(120).optional(),
  status: z.enum(["preparing", "shipped", "in_transit", "delivered", "returned"]),
});

export async function upsertShipmentAction(orderId: number, shipmentId: number | null, formData: FormData) {
  await requireAdminCapability("orders");
  const parsed = shipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  if (!Number.isSafeInteger(orderId) || orderId <= 0) return { error: "Invalid order." };
  if (shipmentId !== null && (!Number.isSafeInteger(shipmentId) || shipmentId <= 0)) {
    return { error: "Invalid shipment." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_upsert_shipment", {
    p_order_id: orderId,
    p_shipment_id: shipmentId,
    p_courier_name: parsed.data.courier_name || null,
    p_tracking_number: parsed.data.tracking_number || null,
    p_status: parsed.data.status,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/shipments");
  revalidatePath("/track");
  revalidatePath("/orders/[orderNumber]", "page");
  return { success: true };
}

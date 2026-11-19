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
  return { success: true };
}

const shipmentSchema = z.object({
  courier_name: z.string().optional(),
  tracking_number: z.string().optional(),
  status: z.enum(["not_shipped", "preparing", "shipped", "in_transit", "delivered", "returned"]),
});

export async function upsertShipmentAction(orderId: number, shipmentId: number | null, formData: FormData) {
  await requireAdminCapability("orders");
  const parsed = shipmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { courier_name, tracking_number, status } = parsed.data;

  const supabase = await createClient();
  const payload = {
    order_id: orderId,
    courier_name: courier_name || null,
    tracking_number: tracking_number || null,
    status,
    shipped_at: status === "shipped" || status === "in_transit" ? new Date().toISOString() : null,
    delivered_at: status === "delivered" ? new Date().toISOString() : null,
  };

  const { error } = shipmentId
    ? await supabase.from("shipments").update(payload).eq("id", shipmentId)
    : await supabase.from("shipments").insert(payload);

  if (error) return { error: error.message };

  await supabase
    .from("orders")
    .update({ shipping_status: status })
    .eq("id", orderId);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/shipments");
  return { success: true };
}

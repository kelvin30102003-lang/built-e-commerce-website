"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminCapability } from "@/lib/auth/require-admin";

const couponSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(40),
  discount_type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  discount_value: z.coerce.number().min(0),
  min_order_amount: z.coerce.number().min(0),
  max_discount_amount: z.string().optional(),
  usage_limit: z.string().optional(),
  expires_at: z.string().optional(),
  is_active: z.string().optional(),
});

export async function createCouponAction(formData: FormData) {
  await requireAdminCapability("coupons");
  const parsed = couponSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at, is_active } =
    parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("coupons").insert({
    code: code.toUpperCase(),
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
    usage_limit: usage_limit ? Number(usage_limit) : null,
    expires_at: expires_at || null,
    is_active: is_active === "on",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCouponAction(id: number, formData: FormData) {
  await requireAdminCapability("coupons");
  const parsed = couponSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, expires_at, is_active } =
    parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("coupons")
    .update({
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      expires_at: expires_at || null,
      is_active: is_active === "on",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCouponAction(id: number) {
  await requireAdminCapability("coupons");
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/coupons");
  return { success: true };
}

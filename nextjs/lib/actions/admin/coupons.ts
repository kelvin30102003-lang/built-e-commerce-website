"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminCapability } from "@/lib/auth/require-admin";

const optionalNonNegativeAmount = z.preprocess(
  (value) => value === "" || value === undefined ? undefined : value,
  z.coerce.number().finite().min(0).optional(),
);

const couponSchema = z.object({
  code: z.string().trim().min(1, "Code is required").max(40).regex(/^[A-Za-z0-9_-]+$/, "Use only letters, numbers, dashes, or underscores in the code."),
  discount_type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  discount_value: z.coerce.number().finite().min(0),
  min_order_amount: z.coerce.number().finite().min(0),
  max_discount_amount: optionalNonNegativeAmount,
  usage_limit: z.preprocess(
    (value) => value === "" || value === undefined ? undefined : value,
    z.coerce.number().int().positive().optional(),
  ),
  expires_at: z.string().max(40).optional(),
  is_active: z.string().optional(),
}).superRefine((coupon, context) => {
  if (coupon.discount_type === "percentage" && coupon.discount_value > 100) {
    context.addIssue({ code: "custom", path: ["discount_value"], message: "Percentage discounts cannot exceed 100%." });
  }
  if (coupon.discount_type === "free_shipping" && coupon.discount_value !== 0) {
    context.addIssue({ code: "custom", path: ["discount_value"], message: "Free shipping coupons must have a discount value of 0." });
  }
  if (coupon.max_discount_amount !== undefined && coupon.discount_type !== "percentage") {
    context.addIssue({ code: "custom", path: ["max_discount_amount"], message: "Maximum discount applies only to percentage coupons." });
  }
  if (coupon.expires_at && !Number.isFinite(Date.parse(coupon.expires_at))) {
    context.addIssue({ code: "custom", path: ["expires_at"], message: "Enter a valid expiration date." });
  }
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
    max_discount_amount: max_discount_amount ?? null,
    usage_limit: usage_limit ?? null,
    expires_at: expires_at || null,
    is_active: is_active === "on",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCouponAction(id: number, formData: FormData) {
  await requireAdminCapability("coupons");
  if (!Number.isSafeInteger(id) || id <= 0) return { error: "Invalid coupon." };
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
      max_discount_amount: max_discount_amount ?? null,
      usage_limit: usage_limit ?? null,
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
  if (!Number.isSafeInteger(id) || id <= 0) return { error: "Invalid coupon." };
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/coupons");
  return { success: true };
}

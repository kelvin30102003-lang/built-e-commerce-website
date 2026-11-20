"use server";

import { z } from "zod";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { SHIPPING_METHODS, YANGON_TOWNSHIPS, isManualPaymentMethod, type ShippingMethodKey } from "@/lib/shop/constants";
import { isValidImageFile } from "@/lib/security/image-validation";
import { consumeActionRateLimit } from "@/lib/security/rate-limit";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  addressLine1: z.string().trim().min(1).max(250),
  city: z.literal("Yangon"),
  township: z.enum(YANGON_TOWNSHIPS),
  state: z.literal("Yangon"),
  country: z.string().trim().min(1).max(100),
  shippingMethod: z.enum(["standard"]),
  paymentMethod: z.enum(["cod", "kbzpay", "wavepay", "ayapay", "cbpay"]),
  customerNote: z.string().trim().max(1000).optional(),
  transactionId: z.string().trim().max(120).optional(),
});

export async function placeOrderAction(formData: FormData) {
  const supabase = await createClient();
  let { data: { user } } = await supabase.auth.getUser();
  const requestedPaymentMethod = formData.get("paymentMethod");
  if (!user) {
    if (requestedPaymentMethod !== "cod") {
      return { error: "Guest checkout is available with Cash on Delivery only.", orderNumber: null };
    }
    if (!(await consumeActionRateLimit("guest-session", "all", 60, 3600))) {
      return { error: "Guest checkout is temporarily unavailable. Try again later.", orderNumber: null };
    }
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      return { error: "Guest checkout is unavailable right now. Please try again later.", orderNumber: null };
    }
    user = data.user;
  }
  if (user.is_anonymous && requestedPaymentMethod !== "cod") {
    return { error: "Guest checkout is available with Cash on Delivery only.", orderNumber: null };
  }
  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    addressLine1: formData.get("addressLine1"),
    city: formData.get("city"),
    township: formData.get("township"),
    state: formData.get("state"),
    country: formData.get("country"),
    shippingMethod: formData.get("shippingMethod"),
    paymentMethod: formData.get("paymentMethod"),
    customerNote: formData.get("customerNote") || undefined,
    transactionId: formData.get("transactionId") || undefined,
  });

  if (!parsed.success) {
    return { error: "Please fill in all required fields.", orderNumber: null };
  }

  const data = parsed.data;
  const isManual = isManualPaymentMethod(data.paymentMethod);

  let slipImagePath: string | null = null;
  if (isManual) {
    const slipFile = formData.get("slipImage");
    if (!(slipFile instanceof File) || slipFile.size === 0) {
      return { error: "Please upload your payment slip.", orderNumber: null };
    }
    if (slipFile.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(slipFile.type)) {
      return { error: "Payment slip must be a JPG, PNG, or WEBP image under 5 MB.", orderNumber: null };
    }
    if (!(await isValidImageFile(slipFile, ["image/jpeg", "image/png", "image/webp"]))) {
      return { error: "Payment slip must be a valid JPG, PNG, or WEBP image.", orderNumber: null };
    }
    if (!data.transactionId?.trim()) {
      return { error: "Transaction number is required for prepaid payment.", orderNumber: null };
    }

    const extension = slipFile.type === "image/png" ? "png" : slipFile.type === "image/webp" ? "webp" : "jpg";
    slipImagePath = `${user.id}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("payment-slips")
      .upload(slipImagePath, slipFile, { contentType: slipFile.type });
    if (uploadError) {
      return { error: `Failed to upload payment slip: ${uploadError.message}`, orderNumber: null };
    }
  }

  const shippingFee = SHIPPING_METHODS[data.shippingMethod as ShippingMethodKey].fee;

  const { data: result, error } = await supabase.rpc("place_order", {
    p_shipping: {
      full_name: data.fullName,
      phone: data.phone,
      address_line1: data.addressLine1,
      address_line2: null,
      city: data.city,
      township: data.township ?? null,
      state: data.state ?? null,
      country: data.country,
      postal_code: null,
    },
    p_shipping_method: data.shippingMethod,
    p_shipping_fee: shippingFee,
    p_payment_method: data.paymentMethod,
    p_customer_note: data.customerNote ?? null,
    p_payment_transaction_id: data.transactionId ?? null,
    p_slip_image_path: slipImagePath,
  });

  if (error) {
    if (slipImagePath) {
      const { error: cleanupError } = await supabase.storage.from("payment-slips").remove([slipImagePath]);
      if (cleanupError) console.error("Failed to clean up unused payment slip:", cleanupError.message);
    }
    return { error: error.message, orderNumber: null };
  }

  const orderNumber = result?.[0]?.order_number ?? null;
  if (!orderNumber && slipImagePath) {
    const { error: cleanupError } = await supabase.storage.from("payment-slips").remove([slipImagePath]);
    if (cleanupError) console.error("Failed to clean up unused payment slip:", cleanupError.message);
  }
  return { error: null, orderNumber };
}

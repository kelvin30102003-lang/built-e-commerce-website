"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { isValidImageFile } from "@/lib/security/image-validation";
import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const BUCKET = "payment-qr";

export async function updatePaymentMethodQrAction(
  code: string,
  formData: FormData
) {
  await requireAdminCapability("orders");
  if (!/^(kbzpay|wavepay|ayapay|cbpay)$/.test(code)) return { error: "Invalid payment method." };
  const selectedFile = formData.get("qrImage");
  const file = selectedFile instanceof File ? selectedFile : null;

  if (!file || file.size === 0) {
    return { error: "Please select an image file." };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only PNG, JPG, WEBP, and GIF images are allowed." };
  }
  if (!(await isValidImageFile(file, ALLOWED_TYPES))) return { error: "The uploaded file is not a valid image." };

  if (file.size > MAX_FILE_SIZE) {
    return { error: "Image must be under 5 MB." };
  }

  const adminClient = createAdminClient();

  // Upload to storage
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
  const path = `${code}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await adminClient.storage
    .from(BUCKET)
    .upload(path, file);

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` };
  }

  const { data: publicUrl } = adminClient.storage
    .from(BUCKET)
    .getPublicUrl(path);

  // Update the payment method row
  const supabase = await createClient();
  const { error: dbError } = await supabase
    .from("payment_methods")
    .update({ qr_image_url: publicUrl.publicUrl })
    .eq("code", code);

  if (dbError) {
    return { error: `Database update failed: ${dbError.message}` };
  }

  revalidatePath("/admin/payment-methods");
  revalidatePath("/checkout");
  return { success: true };
}

export async function removePaymentMethodQrAction(code: string) {
  await requireAdminCapability("orders");
  if (!/^(kbzpay|wavepay|ayapay|cbpay)$/.test(code)) return { error: "Invalid payment method." };
  const supabase = await createClient();

  const { error } = await supabase
    .from("payment_methods")
    .update({ qr_image_url: null })
    .eq("code", code);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/payment-methods");
  revalidatePath("/checkout");
  return { success: true };
}

export async function updatePaymentMethodAction(
  code: string,
  formData: FormData
) {
  await requireAdminCapability("orders");
  if (!/^(kbzpay|wavepay|ayapay|cbpay)$/.test(code)) return { error: "Invalid payment method." };
  const parsed = z.object({
    name: z.string().trim().min(1).max(100),
    account_name: z.string().trim().max(150).optional(),
    account_phone: z.string().trim().max(40).optional(),
    account_number: z.string().trim().max(80).optional(),
    instructions: z.string().trim().max(1000).optional(),
  }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check the payment method details." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("payment_methods")
    .update({
      name: parsed.data.name,
      account_name: parsed.data.account_name || null,
      account_phone: parsed.data.account_phone || null,
      account_number: parsed.data.account_number || null,
      instructions: parsed.data.instructions || null,
    })
    .eq("code", code);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/payment-methods");
  revalidatePath("/checkout");
  return { success: true };
}


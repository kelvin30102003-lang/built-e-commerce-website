"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { YANGON_TOWNSHIPS } from "@/lib/shop/constants";

const addressSchema = z.object({
  id: z.preprocess((value) => value === "" || value === null ? undefined : Number(value), z.number().int().positive().optional()),
  fullName: z.string().trim().min(1, "Enter your full name.").max(120),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().min(1, "Enter your phone number.").max(40),
  country: z.string().refine((value) => value === "Myanmar", "Select a country."),
  addressLine1: z.string().trim().min(1, "Enter your address.").max(250),
  township: z.enum(YANGON_TOWNSHIPS),
});

export async function saveProfileAddressAction(
  formData: FormData,
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return { error: "Sign in to save your address." };

  const parsed = addressSchema.safeParse({
    id: formData.get("id"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    country: formData.get("country"),
    addressLine1: formData.get("addressLine1"),
    township: formData.get("township"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your address details." };

  const { id, fullName, email, phone, country, addressLine1, township } = parsed.data;

  if (email !== (user.email ?? "")) {
    const { error } = await supabase.auth.updateUser({ email });
    if (error) return { error: "Could not update your email. Please try again." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone })
    .eq("id", user.id);
  if (profileError) return { error: "Could not save your profile details. Please try again." };

  const address = {
    full_name: fullName,
    phone,
    address_line1: addressLine1,
    city: "Yangon",
    township,
    state: "Yangon",
    country,
    postal_code: null,
    is_default: true,
  };

  if (id) {
    const { data: existing, error: lookupError } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (lookupError) return { error: "Could not load your saved address." };
    if (!existing) return { error: "That saved address could not be found." };

    const { error } = await supabase
      .from("addresses")
      .update(address)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { error: "Could not save your address. Please try again." };
  } else {
    const { data: existing, error: lookupError } = await supabase
      .from("addresses")
      .select("id")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (lookupError) return { error: "Could not load your saved address." };

    const { error } = existing
      ? await supabase.from("addresses").update(address).eq("id", existing.id).eq("user_id", user.id)
      : await supabase.from("addresses").insert({ ...address, user_id: user.id });
    if (error) return { error: "Could not save your address. Please try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/checkout");
  return {
    success: email !== (user.email ?? "")
      ? "Details saved. Confirm your new email using the link we sent you."
      : "Profile details saved.",
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminCapability } from "@/lib/auth/require-admin";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const brandSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(1000).optional(),
  is_active: z.string().optional(),
});

export async function createBrandAction(formData: FormData) {
  await requireAdminCapability("products");
  const parsed = brandSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, description, is_active } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("brands").insert({
    name,
    slug: slugify(name),
    description: description || null,
    is_active: is_active === "on",
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/brands");
  return { success: true };
}

export async function updateBrandAction(id: number, formData: FormData) {
  await requireAdminCapability("products");
  const parsed = brandSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, description, is_active } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({
      name,
      slug: slugify(name),
      description: description || null,
      is_active: is_active === "on",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/brands");
  return { success: true };
}

export async function deleteBrandAction(id: number) {
  await requireAdminCapability("products");
  const supabase = await createClient();
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/brands");
  return { success: true };
}

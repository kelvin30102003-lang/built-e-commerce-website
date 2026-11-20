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

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  description: z.string().trim().max(1000).optional(),
  parent_id: z.string().optional(),
  is_active: z.string().optional(),
  sort_order: z.string().optional(),
});

export async function createCategoryAction(formData: FormData) {
  await requireAdminCapability("products");
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, description, parent_id, is_active, sort_order } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name,
    slug: slugify(name),
    description: description || null,
    parent_id: parent_id ? Number(parent_id) : null,
    is_active: is_active === "on",
    sort_order: sort_order ? Number(sort_order) : 0,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategoryAction(id: number, formData: FormData) {
  await requireAdminCapability("products");
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, description, parent_id, is_active, sort_order } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug: slugify(name),
      description: description || null,
      parent_id: parent_id ? Number(parent_id) : null,
      is_active: is_active === "on",
      sort_order: sort_order ? Number(sort_order) : 0,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategoryAction(id: number) {
  await requireAdminCapability("products");
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

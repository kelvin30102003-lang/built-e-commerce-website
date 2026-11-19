"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { isValidImageFile } from "@/lib/security/image-validation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const colorSchema = z.object({
  name: z.string().trim().min(1, "Color name is required."),
  slug: z.string().trim().optional(),
  hex_value: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid color swatch."),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.string().optional(),
});

function makeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function saveColor(id: number | null, formData: FormData) {
  await requireAdminCapability("products");
  const parsed = colorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid color." };

  const slug = makeSlug(parsed.data.slug || parsed.data.name);
  if (!slug) return { error: "Enter a URL slug using English letters or numbers." };

  const supabase = await createClient();
  const file = formData.get("image");
  const shouldRemoveImage = formData.get("remove_image") === "on";
  let imageUrl: string | null | undefined;
  let uploadedPath: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_SIZE || !(await isValidImageFile(file, ["image/png", "image/jpeg", "image/webp"]))) {
      return { error: "Use a valid PNG, JPG, or WEBP image under 5 MB." };
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      return { error: "Use a PNG, JPG, or WEBP image." };
    }
    if (file.size > MAX_IMAGE_SIZE) return { error: "Image must be under 5 MB." };

    const admin = createAdminClient();
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    uploadedPath = `color-cards/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await admin.storage.from("product-images").upload(uploadedPath, file);
    if (uploadError) return { error: `Image upload failed: ${uploadError.message}` };
    imageUrl = admin.storage.from("product-images").getPublicUrl(uploadedPath).data.publicUrl;
  } else if (shouldRemoveImage) {
    imageUrl = null;
  }

  const values = {
    name: parsed.data.name,
    slug,
    hex_value: parsed.data.hex_value,
    sort_order: parsed.data.sort_order,
    is_active: parsed.data.is_active === "on",
    ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
  };

  const result = id === null
    ? await supabase.from("product_colors").insert(values)
    : await supabase.from("product_colors").update(values).eq("id", id);

  if (result.error) {
    if (uploadedPath) await createAdminClient().storage.from("product-images").remove([uploadedPath]);
    return { error: result.error.message };
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/colors");
  return { success: true };
}

export async function createColorAction(formData: FormData) {
  return saveColor(null, formData);
}

export async function updateColorAction(id: number, formData: FormData) {
  return saveColor(id, formData);
}

export async function deleteColorAction(id: number) {
  await requireAdminCapability("products");
  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("product_variants")
    .select("id", { count: "exact", head: true })
    .eq("color_id", id);
  if (countError) return { error: countError.message };
  if (count) return { error: "This color is assigned to product variants. Remove it from those variants first." };

  const { error } = await supabase.from("product_colors").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/colors");
  return { success: true };
}

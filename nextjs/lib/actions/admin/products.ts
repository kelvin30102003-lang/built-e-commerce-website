"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { isValidImageFile } from "@/lib/security/image-validation";
import { getPublicObjectPath } from "@/lib/storage/public-object-path";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  short_description: z.string().trim().max(500).optional(),
  description: z.string().trim().max(20000).optional(),
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  status: z.enum(["draft", "active", "inactive", "archived"]),
});

export async function createProductAction(formData: FormData) {
  await requireAdminCapability("products");
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, short_description, description, category_id, brand_id, status } = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug: slugify(name),
      short_description: short_description || null,
      description: description || null,
      category_id: category_id ? Number(category_id) : null,
      brand_id: brand_id ? Number(brand_id) : null,
      status,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    // A product slug is unique. Give admins a direct fix for the common case
    // where they try to create a second product with the same name.
    if (error?.code === "23505") {
      return { error: "A product with this name already exists. Change the product name and try again." };
    }
    return { error: error?.message ?? "Failed to create product" };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${data.id}`);
  return { success: true, productId: data.id };
}

export async function updateProductAction(id: number, formData: FormData) {
  await requireAdminCapability("products");
  if (!Number.isSafeInteger(id) || id <= 0) return { error: "Invalid product." };
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { name, short_description, description, category_id, brand_id, status } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug: slugify(name),
      short_description: short_description || null,
      description: description || null,
      category_id: category_id ? Number(category_id) : null,
      brand_id: brand_id ? Number(brand_id) : null,
      status,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { success: true };
}

export async function deleteProductAction(id: number) {
  await requireAdminCapability("products");
  if (!Number.isSafeInteger(id) || id <= 0) return { error: "Invalid product." };
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  return { success: true };
}

const variantSchema = z.object({
  sku: z.string().trim().min(1, "SKU is required").max(80),
  variant_name: z.string().trim().max(120).optional(),
  price: z.coerce.number().min(0),
  compare_price: z.string().optional(),
  stock_quantity: z.coerce.number().int().min(0),
  low_stock_threshold: z.coerce.number().int().min(0),
  is_active: z.string().optional(),
});

export async function createVariantAction(productId: number, formData: FormData) {
  await requireAdminCapability("products");
  if (!Number.isSafeInteger(productId) || productId <= 0) return { error: "Invalid product." };
  const parsed = variantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { sku, variant_name, price, compare_price, stock_quantity, low_stock_threshold, is_active } =
    parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    sku,
    variant_name: variant_name || null,
    price,
    compare_price: compare_price ? Number(compare_price) : null,
    stock_quantity,
    low_stock_threshold,
    is_active: is_active === "on",
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function updateVariantAction(id: number, productId: number, formData: FormData) {
  await requireAdminCapability("products");
  if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(productId) || productId <= 0) {
    return { error: "Invalid product variant." };
  }
  const parsed = variantSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { sku, variant_name, price, compare_price, stock_quantity, low_stock_threshold, is_active } =
    parsed.data;

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_variants")
    .update({
      sku,
      variant_name: variant_name || null,
      price,
      compare_price: compare_price ? Number(compare_price) : null,
      stock_quantity,
      low_stock_threshold,
      is_active: is_active === "on",
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function deleteVariantAction(id: number, productId: number) {
  await requireAdminCapability("products");
  if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(productId) || productId <= 0) {
    return { error: "Invalid product variant." };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("product_variants").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function addProductImageAction(productId: number, formData: FormData) {
  await requireAdminCapability("products");
  if (!Number.isSafeInteger(productId) || productId <= 0) return { error: "Invalid product." };
  const selectedFile = formData.get("image");
  const file = selectedFile instanceof File ? selectedFile : null;
  if (!file || file.size === 0 || file.size > 5 * 1024 * 1024) return { error: "Choose an image under 5 MB." };
  if (!(await isValidImageFile(file, ["image/jpeg", "image/png", "image/webp"]))) return { error: "The uploaded file is not a valid JPG, PNG, or WEBP image." };

  const supabase = await createClient();
  const adminClient = createAdminClient();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  // Use admin client for storage (bypasses RLS, has full bucket access)
  const { error: uploadError } = await adminClient.storage.from("product-images").upload(path, file);
  if (uploadError) return { error: uploadError.message };

  const { data: publicUrl } = adminClient.storage.from("product-images").getPublicUrl(path);

  const { count, error: countError } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);
  if (countError) {
    await adminClient.storage.from("product-images").remove([path]);
    return { error: countError.message };
  }

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    image_url: publicUrl.publicUrl,
    sort_order: count ?? 0,
  });

  if (error) {
    await adminClient.storage.from("product-images").remove([path]);
    return { error: error.message };
  }

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function deleteProductImageAction(imageId: number, productId: number) {
  await requireAdminCapability("products");
  if (!Number.isSafeInteger(imageId) || imageId <= 0 || !Number.isSafeInteger(productId) || productId <= 0) {
    return { error: "Invalid product image." };
  }
  const supabase = await createClient();
  const { data: image, error: readError } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("id", imageId)
    .eq("product_id", productId)
    .maybeSingle();
  if (readError) return { error: readError.message };
  if (!image) return { error: "Product image not found." };

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId);
  if (error) return { error: error.message };

  const imagePath = getPublicObjectPath(image.image_url, "product-images");
  if (imagePath) {
    const { error: cleanupError } = await createAdminClient().storage.from("product-images").remove([imagePath]);
    if (cleanupError) console.error("Product image cleanup failed:", cleanupError.message);
  }

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

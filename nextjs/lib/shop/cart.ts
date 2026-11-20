import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

const MAX_QUANTITY = 99;

export async function fetchCartItemCount(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { data: rows, error } = await supabase
    .from("cart_items")
    .select("quantity, carts!inner(user_id)")
    .eq("carts.user_id", userId);

  if (error) {
    console.error("Could not load cart count:", error.message);
    return 0;
  }
  return (rows ?? []).reduce((total, row) => total + row.quantity, 0);
}

export interface CartLine {
  id: number;
  productId: number;
  variantId: number | null;
  productName: string;
  variantName: string | null;
  slug: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stockQuantity: number;
  isAvailable: boolean;
}

export interface CartDetails {
  items: CartLine[];
  subtotal: number;
  itemCount: number;
}

export async function fetchCartDetails(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CartDetails> {
  const { data: rows, error } = await supabase
    .from("cart_items")
    .select(
      `id, quantity, product_id, product_variant_id,
       carts!inner(user_id),
       products(name, slug, product_images(image_url, sort_order)),
       product_variants(price, variant_name, stock_quantity, is_active)`,
    )
    .eq("carts.user_id", userId);

  if (error) {
    console.error("Could not load cart items:", error);
    throw new Error("Could not load your cart items.");
  }

  const items: CartLine[] = [];
  for (const row of rows ?? []) {
    const variant = row.product_variants as unknown as {
      price: number;
      variant_name: string | null;
      stock_quantity: number;
      is_active: boolean;
    } | null;
    const product = row.products as unknown as {
      name: string;
      slug: string;
      product_images: { image_url: string; sort_order: number }[];
    } | null;

    const images = [...(product?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const quantity = Math.min(row.quantity, MAX_QUANTITY);
    const isAvailable = Boolean(product && variant?.is_active);

    items.push({
      id: row.id,
      productId: row.product_id,
      variantId: row.product_variant_id,
      productName: product?.name ?? "Unavailable product",
      variantName: variant?.variant_name ?? null,
      slug: product?.slug ?? "",
      imageUrl: images[0]?.image_url ?? null,
      quantity,
      unitPrice: variant?.price ?? 0,
      lineTotal: (variant?.price ?? 0) * quantity,
      stockQuantity: isAvailable ? variant?.stock_quantity ?? 0 : 0,
      isAvailable,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, itemCount };
}

export async function addCartItem(
  supabase: SupabaseClient<Database>,
  productId: number,
  variantId: number,
  quantity: number,
) {
  const { error } = await supabase.rpc("add_cart_item", {
    p_product_id: productId,
    p_variant_id: variantId,
    p_quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY),
  });
  if (error) throw error;
}

export async function updateCartItemQuantity(
  supabase: SupabaseClient<Database>,
  cartItemId: number,
  quantity: number,
) {
  const clamped = Math.min(Math.max(quantity, 1), MAX_QUANTITY);
  const { error } = await supabase.rpc("update_cart_item_quantity", {
    p_cart_item_id: cartItemId,
    p_quantity: clamped,
  });
  if (error) throw error;
}

export async function removeCartItem(supabase: SupabaseClient<Database>, cartItemId: number) {
  const { error } = await supabase.rpc("remove_cart_item", { p_cart_item_id: cartItemId });
  if (error) throw error;
}

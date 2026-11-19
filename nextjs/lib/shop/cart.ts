import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

const MAX_QUANTITY = 99;

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
}

export interface CartDetails {
  items: CartLine[];
  subtotal: number;
  itemCount: number;
}

export async function getOrCreateCartId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<number> {
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) throw error;
  return created.id;
}

export async function fetchCartDetails(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<CartDetails> {
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!cart) {
    return { items: [], subtotal: 0, itemCount: 0 };
  }

  const { data: rows, error } = await supabase
    .from("cart_items")
    .select(
      `id, quantity, product_id, product_variant_id,
       products(name, slug, product_images(image_url, sort_order)),
       product_variants(price, variant_name, stock_quantity, is_active)`,
    )
    .eq("cart_id", cart.id);

  if (error) {
    console.error("Could not load cart items:", error);
    return { items: [], subtotal: 0, itemCount: 0 };
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

    if (!product || !variant || !variant.is_active) continue;

    const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const quantity = Math.min(row.quantity, Math.max(variant.stock_quantity, 0) || row.quantity, MAX_QUANTITY);

    items.push({
      id: row.id,
      productId: row.product_id,
      variantId: row.product_variant_id,
      productName: product.name,
      variantName: variant.variant_name,
      slug: product.slug,
      imageUrl: images[0]?.image_url ?? null,
      quantity,
      unitPrice: variant.price,
      lineTotal: variant.price * quantity,
      stockQuantity: variant.stock_quantity,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, itemCount };
}

export async function addCartItem(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: number,
  variantId: number,
  quantity: number,
) {
  const cartId = await getOrCreateCartId(supabase, userId);

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .eq("product_variant_id", variantId)
    .maybeSingle();

  if (existing) {
    const nextQuantity = Math.min(existing.quantity + quantity, MAX_QUANTITY);
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: nextQuantity })
      .eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: productId,
    product_variant_id: variantId,
    quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY),
  });
  if (error) throw error;
}

export async function updateCartItemQuantity(
  supabase: SupabaseClient<Database>,
  cartItemId: number,
  quantity: number,
) {
  const clamped = Math.min(Math.max(quantity, 1), MAX_QUANTITY);
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity: clamped })
    .eq("id", cartItemId);
  if (error) throw error;
}

export async function removeCartItem(supabase: SupabaseClient<Database>, cartItemId: number) {
  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
  if (error) throw error;
}

export async function clearCart(supabase: SupabaseClient<Database>, userId: string) {
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!cart) return;
  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);
  if (error) throw error;
}

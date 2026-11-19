"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { addCartItem, removeCartItem, updateCartItemQuantity } from "@/lib/shop/cart";

const addSchema = z.object({
  productId: z.coerce.number().int().positive(),
  variantId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99).default(1),
});

export async function addToCartAction(formData: FormData) {
  const supabase = await createClient();
  const parsed = addSchema.safeParse({
    productId: formData.get("productId"),
    variantId: formData.get("variantId"),
    quantity: formData.get("quantity") ?? 1,
  });
  if (!parsed.success) {
    return { error: "Invalid product selection." };
  }

  let { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      return { error: "Guest checkout is unavailable right now. Please try again later." };
    }
    user = data.user;
  }

  await addCartItem(supabase, user.id, parsed.data.productId, parsed.data.variantId, parsed.data.quantity);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { error: null };
}

const updateSchema = z.object({
  cartItemId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export async function updateCartItemAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const parsed = updateSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) return { error: "Invalid quantity." };

  await updateCartItemQuantity(supabase, parsed.data.cartItemId, parsed.data.quantity);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { error: null };
}

const removeSchema = z.object({ cartItemId: z.coerce.number().int().positive() });

export async function removeCartItemAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const parsed = removeSchema.safeParse({ cartItemId: formData.get("cartItemId") });
  if (!parsed.success) return { error: "Invalid request." };

  await removeCartItem(supabase, parsed.data.cartItemId);
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { error: null };
}

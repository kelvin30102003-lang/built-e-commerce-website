"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const wishlistSchema = z.object({
  productId: z.number().int().positive(),
  shouldAdd: z.boolean(),
});

export async function setWishlistItemAction(productId: number, shouldAdd: boolean) {
  const parsed = wishlistSchema.safeParse({ productId, shouldAdd });
  if (!parsed.success) return { error: "Invalid wishlist request." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.is_anonymous) return { error: "Please log in to save products to your wishlist." };

  if (shouldAdd) {
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("status", "active")
      .maybeSingle();
    if (!product) return { error: "This product is no longer available." };

    const { error } = await supabase
      .from("wishlist_items")
      .upsert(
        { user_id: user.id, product_id: productId },
        { onConflict: "user_id,product_id", ignoreDuplicates: true },
      );
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    if (error) return { error: error.message };
  }

  revalidatePath("/wishlist");
  return { isWishlisted: shouldAdd };
}

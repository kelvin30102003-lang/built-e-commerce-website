import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

export async function fetchWishlistedProductIds(
  supabase: SupabaseClient<Database>,
  productIds: number[],
) {
  if (productIds.length === 0) return [];

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id)
    .in("product_id", productIds);

  if (error) return [];
  return data.map((item) => item.product_id);
}

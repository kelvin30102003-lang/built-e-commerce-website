import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { getCurrentUser } from "@/lib/auth/get-current-profile";

export async function fetchWishlistedProductIds(
  supabase: SupabaseClient<Database>,
  productIds: number[],
) {
  if (productIds.length === 0) return [];

  const user = await getCurrentUser();
  if (!user || user.is_anonymous) return [];

  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id)
    .in("product_id", productIds);

  if (error) return [];
  return data.map((item) => item.product_id);
}

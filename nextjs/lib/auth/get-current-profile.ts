import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, can_manage_products, can_manage_orders, can_manage_users, can_manage_coupons, can_manage_reports")
      .eq("id", user.id)
      .single();

    return { user, profile };
  } catch {
    // If the profiles table doesn't exist yet, just return null
    return { user: null, profile: null };
  }
}

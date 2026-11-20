import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});

export const getCurrentProfile = cache(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return { user: null, profile: null };

    const supabase = await createClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, can_manage_products, can_manage_orders, can_manage_users, can_manage_coupons, can_manage_reports")
      .eq("id", user.id)
      .single();

    return { user, profile };
  } catch {
    // If the profiles table is unavailable, keep the authenticated user context.
    const user = await getCurrentUser();
    if (user) return { user, profile: null };
    return { user: null, profile: null };
  }
});

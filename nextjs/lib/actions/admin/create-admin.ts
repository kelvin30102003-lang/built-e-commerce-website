"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { log_admin_activity } from "@/lib/supabase/rpc";
import { consumeActionRateLimit } from "@/lib/security/rate-limit";

export async function createAdminAccountAction(formData: FormData) {
  const { user: currentAdmin } = await requireAdmin();

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!fullName || fullName.length > 120) {
    return { error: "Enter a name up to 120 characters." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 12 || password.length > 128) {
    return { error: "Password must be between 12 and 128 characters." };
  }
  if (!currentPassword || currentPassword.length > 128) {
    return { error: "Enter your current admin password to confirm this action." };
  }
  if (!(await consumeActionRateLimit("create-admin", currentAdmin.id, 5, 3600))) {
    return { error: "Too many admin account creation attempts. Try again later." };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !publicKey || !currentAdmin.email) {
      return { error: "Could not verify the current admin credentials." };
    }

    const verifier = createSupabaseClient<Database>(supabaseUrl, publicKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    const { data: verification, error: verificationError } = await verifier.auth.signInWithPassword({
      email: currentAdmin.email,
      password: currentPassword,
    });
    if (verificationError || verification.user?.id !== currentAdmin.id) {
      return { error: "Your current admin password is incorrect." };
    }

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: "Supabase did not return the new user." };

    const { error: profileError } = await admin.from("profiles").upsert(
      { id: data.user.id, full_name: fullName, role: "admin" },
      { onConflict: "id" },
    );
    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id);
      return { error: `Admin profile could not be created: ${profileError.message}` };
    }

    await log_admin_activity("create_admin_account", { email });
    revalidatePath("/admin/users");
    revalidatePath("/admin/create-admin");
    return { success: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create the admin account.",
    };
  }
}

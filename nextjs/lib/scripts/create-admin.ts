// Script to create an admin user in Supabase.
// Requires SUPABASE_SERVICE_ROLE_KEY in the environment (never expose this
// key to the browser or commit it — it bypasses RLS entirely).
// Run with: npx tsx ./lib/scripts/create-admin.ts <email> <password>

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.",
  );
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdmin(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) {
    console.error("Failed to create auth user:", authError.message);
    process.exit(1);
  }

  const userId = authData.user?.id;
  if (!userId) {
    console.error("No user ID returned after creation");
    process.exit(1);
  }

  // handle_new_user() (migration 0002) already inserted a profile row; promote it.
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "admin", full_name: "Admin" })
    .eq("id", userId);
  if (profileError) {
    console.error("Failed to promote admin profile:", profileError.message);
    process.exit(1);
  }

  console.log("Admin user created successfully:", email);
}

const [, , email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: npx tsx ./lib/scripts/create-admin.ts <email> <password>");
  process.exit(1);
}

createAdmin(email, password).catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});

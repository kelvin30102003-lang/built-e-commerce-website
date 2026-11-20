import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/shop/logout-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between border-b border-surface-dim pb-6">
        <div>
          <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground">
            {profile?.full_name || "My Profile"}
          </h1>
          <p className="text-sm text-secondary">{user.email}</p>
        </div>
        <LogoutButton />
      </div>

    </div>
  );
}

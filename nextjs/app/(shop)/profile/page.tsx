import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { LogoutButton } from "@/components/shop/logout-button";
import { ProfileAddressForm } from "@/components/shop/profile-address-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/profile");

  const [{ data: savedProfile }, { data: address }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle(),
    user.is_anonymous
      ? Promise.resolve({ data: null })
      : supabase
          .from("addresses")
          .select("id, full_name, phone, address_line1, township, country")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
  ]);

  return (
    <main className="mx-auto min-h-[65vh] max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
      <div className="mb-4 flex justify-end">
        <LogoutButton />
      </div>
      <ProfileAddressForm
        profile={{
          id: address?.id,
          fullName: address?.full_name ?? savedProfile?.full_name ?? "",
          email: user.email ?? "",
          phone: address?.phone ?? savedProfile?.phone ?? "",
          country: address?.country ?? "",
          addressLine1: address?.address_line1 ?? "",
          township: address?.township ?? "",
        }}
      />
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("contact_settings")
    .select("support_email, support_phone, support_address")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground">Contact Us</h1>
      {settings && (
        <div className="mt-4 flex flex-col gap-1 border-t border-surface-dim pt-4 text-sm text-secondary">
          {settings.support_email && <p>Email: {settings.support_email}</p>}
          {settings.support_phone && <p>Phone: {settings.support_phone}</p>}
          {settings.support_address && <p>Address: {settings.support_address}</p>}
        </div>
      )}
    </div>
  );
}

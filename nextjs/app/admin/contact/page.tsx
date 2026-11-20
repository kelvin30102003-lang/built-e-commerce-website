import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { log_admin_activity } from "@/lib/supabase/rpc";
import { ContactSavedToast } from "@/components/admin/contact-saved-toast";

export async function saveContactSettingsAction(formData: FormData) {
  "use server";
  await requireAdmin();

  const fields = {
    support_email: String(formData.get("support_email") ?? "").trim(),
    support_phone: String(formData.get("support_phone") ?? "").trim(),
    support_address: String(formData.get("support_address") ?? "").trim(),
    opening_hours: String(formData.get("opening_hours") ?? "").trim(),
  };

  if (fields.support_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.support_email)) {
    throw new Error("Please enter a valid email address.");
  }
  if (Object.values(fields).some((value) => value.length > 1000)) {
    throw new Error("Each contact detail must be 1000 characters or fewer.");
  }

  const values = {
    support_email: fields.support_email || null,
    support_phone: fields.support_phone || null,
    support_address: fields.support_address || null,
    opening_hours: fields.opening_hours || null,
  };

  const supabase = await createClient();
  const { data: existing, error: readError } = await supabase
    .from("contact_settings")
    .select("id")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (readError) throw readError;

  const result = existing
    ? await supabase.from("contact_settings").update(values).eq("id", existing.id)
    : await supabase.from("contact_settings").insert({ ...values, is_active: true });
  if (result.error) throw result.error;

  await log_admin_activity("update_contact_settings", {
    hasEmail: Boolean(values.support_email),
    hasPhone: Boolean(values.support_phone),
    hasAddress: Boolean(values.support_address),
    hasOpeningHours: Boolean(values.opening_hours),
  });

  revalidatePath("/admin/contact");
  revalidatePath("/contact");
  redirect("/admin/contact?saved=1");
}

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();
  const { data: settings, error } = await supabase
    .from("contact_settings")
    .select("support_email, support_phone, support_address, opening_hours")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  const inputClass = "mt-1 block w-full rounded-lg border border-surface-dim bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Contact Details</h1>
        <p className="mt-1 text-sm text-secondary">
          Update the contact information shown on your store’s Contact Us page.
        </p>
      </header>

      {params.saved === "1" && <ContactSavedToast />}

      <form action={saveContactSettingsAction} className="space-y-5 rounded-xl border border-surface-dim bg-white p-5 sm:p-6">
        <div>
          <label htmlFor="support_email" className="block text-sm font-medium text-foreground">Email</label>
          <input id="support_email" name="support_email" type="email" maxLength={1000} defaultValue={settings?.support_email ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="support_phone" className="block text-sm font-medium text-foreground">Phone number</label>
          <input id="support_phone" name="support_phone" type="tel" maxLength={1000} defaultValue={settings?.support_phone ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="support_address" className="block text-sm font-medium text-foreground">Address</label>
          <textarea id="support_address" name="support_address" rows={3} maxLength={1000} defaultValue={settings?.support_address ?? ""} className={inputClass} />
        </div>
        <div>
          <label htmlFor="opening_hours" className="block text-sm font-medium text-foreground">Opening hours</label>
          <textarea id="opening_hours" name="opening_hours" rows={3} maxLength={1000} placeholder={"Example: Monday–Saturday, 9:00 AM–6:00 PM"} defaultValue={settings?.opening_hours ?? ""} className={inputClass} />
          <p className="mt-1 text-xs text-secondary">You can use multiple lines for different days.</p>
        </div>
        <button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
          Save contact details
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAdminAccountAction } from "@/lib/actions/admin/create-admin";
import { AdminSuccessToast } from "@/components/admin/admin-success-toast";

export function CreateAdminForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await createAdminAccountAction(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  const inputClass = "mt-1 block w-full rounded-lg border border-surface-dim bg-white px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary";

  return (
    <form action={handleSubmit} className="space-y-5 rounded-xl border border-surface-dim bg-white p-5 sm:p-6">
      {success && <AdminSuccessToast message="Admin account created successfully." onDismiss={() => setSuccess(false)} />}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground">Full name</label>
        <input id="fullName" name="fullName" type="text" autoComplete="name" required maxLength={120} className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">Email address</label>
        <input id="email" name="email" type="email" autoComplete="email" required maxLength={255} className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">Temporary password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} className={inputClass} />
        <p className="mt-1 text-xs text-secondary">At least 12 characters. Share it securely with the new admin.</p>
      </div>
      <div className="border-t border-surface-dim pt-5">
        <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground">Your current admin password</label>
        <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className={inputClass} />
        <p className="mt-1 text-xs text-secondary">Confirm your identity before creating another admin account.</p>
      </div>

      <button type="submit" disabled={pending} className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Creating account…" : "Create admin account"}
      </button>
    </form>
  );
}

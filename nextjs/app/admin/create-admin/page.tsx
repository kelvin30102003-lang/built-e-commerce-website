import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function CreateAdminPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Create Admin Account</h1>
        <p className="mt-1 text-sm text-secondary">
          Create a sign-in account with full admin access to the store dashboard.
        </p>
      </header>
      <CreateAdminForm />
    </div>
  );
}

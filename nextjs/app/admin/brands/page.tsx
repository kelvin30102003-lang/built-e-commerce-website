import { createClient } from "@/lib/supabase/server";
import { BrandList } from "@/components/admin/brand-list";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

export default async function AdminBrandsPage() {
  await requireAdminCapability("products");
  const supabase = await createClient();
  const { data: brands, error } = await supabase
    .from("brands")
    .select("id, name, description, is_active")
    .order("name", { ascending: true });
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Brands</h1>
      <BrandList brands={brands ?? []} />
    </div>
  );
}

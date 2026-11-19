import { createClient } from "@/lib/supabase/server";
import { BrandList } from "@/components/admin/brand-list";

export default async function AdminBrandsPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, description, is_active")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Brands</h1>
      <BrandList brands={brands ?? []} />
    </div>
  );
}

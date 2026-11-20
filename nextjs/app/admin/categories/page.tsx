import { createClient } from "@/lib/supabase/server";
import { CategoryList } from "@/components/admin/category-list";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

export default async function AdminCategoriesPage() {
  await requireAdminCapability("products");
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, description, parent_id, is_active, sort_order, is_color_filter_category")
    .order("sort_order", { ascending: true });
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
      <CategoryList categories={categories ?? []} />
    </div>
  );
}

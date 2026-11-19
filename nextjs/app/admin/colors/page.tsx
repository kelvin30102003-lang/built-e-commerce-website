import { createClient } from "@/lib/supabase/server";
import { ColorManager } from "@/components/admin/color-manager";

export default async function AdminColorsPage() {
  const supabase = await createClient();
  const { data: colors } = await supabase
    .from("product_colors")
    .select("id, name, slug, image_url, hex_value, is_active, sort_order")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Product Colors</h1>
        <p className="mt-1 text-sm text-secondary">Manage color cards and lens variant colors.</p>
      </div>
      <ColorManager colors={colors ?? []} />
    </div>
  );
}

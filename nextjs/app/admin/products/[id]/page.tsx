import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { VariantManager } from "@/components/admin/variant-manager";
import { ImageManager } from "@/components/admin/image-manager";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminCapability("products");
  const { id } = await params;
  const productId = Number(id);
  const supabase = await createClient();

  const [{ data: product, error: productError }, { data: categories, error: categoriesError }, { data: brands, error: brandsError }, { data: variants, error: variantsError }, { data: images, error: imagesError }, { data: colors, error: colorsError }] =
    await Promise.all([
      supabase
        .from("products")
        .select("id, name, short_description, description, category_id, brand_id, status")
        .eq("id", productId)
        .maybeSingle(),
      supabase.from("categories").select("id, name, is_color_filter_category").order("name"),
      supabase.from("brands").select("id, name").order("name"),
      supabase
        .from("product_variants")
        .select("id, sku, variant_name, color_id, color:product_colors(name), price, compare_price, stock_quantity, low_stock_threshold, is_active")
        .eq("product_id", productId)
        .order("id"),
      supabase
        .from("product_images")
        .select("id, image_url, sort_order")
        .eq("product_id", productId)
        .order("sort_order"),
      supabase.from("product_colors").select("id, name").order("sort_order"),
    ]);

  const queryError = productError ?? categoriesError ?? brandsError ?? variantsError ?? imagesError ?? colorsError;
  if (queryError) return <ErrorMessage error={queryError} />;

  if (!product) notFound();

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold text-slate-900">Edit Product</h1>

      {/* ── Product Details ── */}
      <ProductForm product={product} categories={categories ?? []} brands={brands ?? []} />

      {/* ── Images ── shown right after details so admin uploads images first ── */}
      <div className="rounded-xl border border-pink-100 bg-white p-5 space-y-3">
        <div>
          <h2 className="font-semibold text-slate-900">Product Images</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            First image will be the main product photo. You can upload multiple images.
          </p>
        </div>
        <ImageManager productId={productId} images={images ?? []} />
      </div>

      {/* ── Variants ── */}
      <div className="rounded-xl border border-pink-100 bg-white p-5 space-y-3">
        <div>
          <h2 className="font-semibold text-slate-900">Variants &amp; Pricing</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add SKU, price, and stock quantity for each variant.
          </p>
        </div>
        <VariantManager
          productId={productId}
          variants={variants ?? []}
          colors={colors ?? []}
          requiresColor={categories?.find((category) => category.id === product.category_id)?.is_color_filter_category ?? false}
        />
      </div>
    </div>
  );
}

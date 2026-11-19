import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { createClient } from "@/lib/supabase/server";

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold uppercase tracking-tight text-foreground">Your Wishlist</h1>
        <p className="mt-3 text-sm text-secondary">Sign in to save and view your favourite products.</p>
        <Link href="/login?redirect=/wishlist" className="mt-8 inline-block bg-primary px-8 py-3 text-[11px] font-semibold uppercase tracking-label-wide text-primary-foreground">
          Sign In
        </Link>
      </section>
    );
  }

  const { data: savedItems, error: wishlistError } = await supabase
    .from("wishlist_items")
    .select("product_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (wishlistError) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold uppercase tracking-tight text-foreground">Your Wishlist</h1>
        <p className="mt-3 text-sm text-error">Your wishlist could not be loaded.</p>
      </section>
    );
  }

  const productIds = (savedItems ?? []).map((item) => item.product_id);
  const { data: products, error: productsError } = productIds.length
    ? await supabase
        .from("products")
        .select("id, name, slug, short_description, product_images(image_url, sort_order), product_variants(id, price, compare_price, is_active, stock_quantity)")
        .in("id", productIds)
        .eq("status", "active")
    : { data: [], error: null };

  if (productsError) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold uppercase tracking-tight text-foreground">Your Wishlist</h1>
        <p className="mt-3 text-sm text-error">Your saved products could not be loaded.</p>
      </section>
    );
  }

  const byId = new Map((products ?? []).map((product) => [product.id, product]));
  const savedProducts = productIds.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  });

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <div className="flex items-end justify-between border-b border-surface-dim pb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-label text-secondary">Saved products</span>
          <h1 className="mt-1 text-2xl font-semibold uppercase tracking-tight text-foreground">Your Wishlist</h1>
        </div>
        <span className="text-sm text-secondary">{savedProducts.length} items</span>
      </div>

      {savedProducts.length === 0 ? (
        <div className="py-14 text-center">
          <p className="text-secondary">Your wishlist is empty.</p>
          <Link href="/shop" className="mt-5 inline-block text-sm text-foreground underline underline-offset-4">Browse products</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} initiallyWishlisted />
          ))}
        </div>
      )}
    </section>
  );
}

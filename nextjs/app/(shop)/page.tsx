import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ProductCard,
  type ProductCardData,
} from "@/components/shop/product-card";
import { fetchWishlistedProductIds } from "@/lib/shop/wishlist";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch products – gracefully handle missing tables
  let products: (ProductCardData & { id: number })[] = [];

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        `id, name, slug, short_description, status, created_at,
         category:categories(id, name, slug),
         brand:brands(id, name, slug),
         product_variants(id, price, compare_price, stock_quantity, is_active),
         product_images(id, image_url, sort_order)`,
        { count: "exact" },
      )
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(0, 7);

    if (!error && data) {
      products = data;
    }
  } catch {
    // table may not exist yet
  }

  const wishlistedProductIds = await fetchWishlistedProductIds(
    supabase,
    products.map((product) => product.id),
  );

  return (
    <div className="flex flex-col">
      {/* ====================================================== */}
      {/* HERO                                                   */}
      {/* ====================================================== */}

      <section className="flex min-h-[420px] w-full items-end bg-surface-low sm:min-h-[560px]">
        <div className="relative z-10 w-full max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
          <div className="flex max-w-xl flex-col gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-label-wide text-foreground/70 ">
              New Season
            </span>

            <h1 className="text-4xl font-semibold uppercase leading-tight tracking-tight text-foreground sm:text-5xl ">
              Cute finds for everyday joy
            </h1>

            <p className="max-w-md text-foreground/80 ">
              Plushies, home decor, and adorable essentials curated just for
              you.
            </p>

            <Link
              href="/shop"
              className="mt-2 inline-flex w-fit items-center gap-3 bg-foreground px-8 py-4 text-[11px] font-semibold uppercase tracking-label-wide text-surface-lowest transition-colors hover:bg-foreground/80"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
        {/* ====================================================== */}
        {/* NEW ARRIVALS                                          */}
        {/* ====================================================== */}

        <section className="mt-12">
          <div className="flex items-end justify-between border-b border-surface-dim pb-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-label text-secondary">
                Latest
              </span>

              <h2 className="mt-1 text-2xl font-medium uppercase tracking-tight text-foreground ">
                New Arrivals
              </h2>
            </div>

            <Link
              href="/shop"
              className="text-[11px] font-semibold uppercase tracking-label text-foreground underline underline-offset-4 transition-colors hover:text-secondary"
            >
              View all
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="mt-6 text-secondary ">
              No products yet. Check back soon!
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  initiallyWishlisted={wishlistedProductIds.includes(product.id)}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

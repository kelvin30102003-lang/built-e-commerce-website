import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { fetchActiveBrands, fetchActiveCategories, fetchProducts } from "@/lib/shop/queries";
import { ProductCard } from "@/components/shop/product-card";
import { fetchWishlistedProductIds } from "@/lib/shop/wishlist";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "name_asc", label: "Name (A-Z)" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const sort = (params.sort as "newest" | "name_asc") ?? "newest";
  const direction = params.direction === "before" ? "before" : "after";

  const [{ products, hasNext, hasPrev, nextCursor, prevCursor }, categories, brands] =
    await Promise.all([
      fetchProducts(supabase, {
        search: params.q,
        categorySlug: params.category,
        brandSlug: params.brand,
        sort,
        cursor: params.cursor,
        direction,
      }),
      fetchActiveCategories(supabase),
      fetchActiveBrands(supabase),
    ]);
  const wishlistedProductIds = await fetchWishlistedProductIds(
    supabase,
    products.map((product) => product.id),
  );

  // Filter changes (search/category/brand/sort) always restart from the first page.
  function buildHref(overrides: Record<string, string | undefined>) {
    const next = new URLSearchParams();
    const merged = { q: params.q, category: params.category, brand: params.brand, sort: params.sort, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) next.set(key, value);
    }
    return `/shop?${next.toString()}`;
  }

  function buildPageHref(cursor: string | null, dir: "after" | "before") {
    return buildHref({ cursor: cursor ?? undefined, direction: dir });
  }

  return (
    <div>*
      <section className="w-full bg-surface py-8 sm:py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:px-8">
          <div>
            
            <h1 className="mt-1 text-3xl font-semibold uppercase tracking-tight text-foreground sm:text-4xl ">
              Shop
            </h1>
          </div>

          <form className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap" action="/shop">
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="SEARCH PRODUCTS..."
              className="col-span-2 min-w-0 bg-surface-lowest px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-secondary focus:outline-none sm:min-w-[200px] sm:flex-1"
            />
            <select
              name="category"
              defaultValue={params.category ?? ""}
              className="w-full min-w-0 bg-surface-lowest px-3 py-3 text-[11px] font-semibold uppercase tracking-label text-foreground shadow-sm focus:outline-none sm:w-auto sm:px-4"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              name="brand"
              defaultValue={params.brand ?? ""}
              className="w-full min-w-0 bg-surface-lowest px-3 py-3 text-[11px] font-semibold uppercase tracking-label text-foreground shadow-sm focus:outline-none sm:w-auto sm:px-4"
            >
              <option value="">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="col-span-2 w-full min-w-0 bg-surface-lowest px-3 py-3 text-[11px] font-semibold uppercase tracking-label text-foreground shadow-sm focus:outline-none sm:col-span-1 sm:w-auto sm:px-4"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="col-span-2 bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-label-wide text-primary-foreground transition-colors hover:bg-surface-highest hover:text-foreground sm:col-span-1"
            >
              Apply
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        {products.length === 0 ? (
          <p className="mt-10 text-secondary">No products match your filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                initiallyWishlisted={wishlistedProductIds.includes(product.id)}
              />
            ))}
          </div>
        )}

        {(hasPrev || hasNext) && (
          <nav className="mt-10 flex justify-center gap-3">
            {hasPrev ? (
              <Link
                href={buildPageHref(prevCursor, "before")}
                className="flex h-10 items-center justify-center px-6 text-[11px] font-semibold uppercase tracking-label transition-colors bg-surface-low text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                Previous
              </Link>
            ) : (
              <span className="flex h-10 items-center justify-center px-6 text-[11px] font-semibold uppercase tracking-label text-secondary opacity-50">
                Previous
              </span>
            )}
            {hasNext ? (
              <Link
                href={buildPageHref(nextCursor, "after")}
                className="flex h-10 items-center justify-center px-6 text-[11px] font-semibold uppercase tracking-label transition-colors bg-surface-low text-foreground hover:bg-primary hover:text-primary-foreground"
              >
                Next
              </Link>
            ) : (
              <span className="flex h-10 items-center justify-center px-6 text-[11px] font-semibold uppercase tracking-label text-secondary opacity-50">
                Next
              </span>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/shop/product-card";
import { fetchWishlistedProductIds } from "@/lib/shop/wishlist";
import { fetchProducts } from "@/lib/shop/queries";

export default async function HomePage() {
  const supabase = await createClient();

  const { products, error: productsError } = await fetchProducts(supabase, { pageSize: 8 });

  const wishlistedProductIds = await fetchWishlistedProductIds(
    supabase,
    products.map((product) => product.id),
  );

  return (
    <div className="flex flex-col">
      {/* ====================================================== */}
      {/* HERO                                                   */}
      {/* ====================================================== */}

      <section className="flex min-h-[420px] w-full items-center bg-white sm:min-h-[480px]">
        <div className="mx-auto w-full max-w-7xl min-w-0 px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="w-full min-w-0 max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-600 sm:text-xs">
              <span className="h-px w-8 bg-neutral-500" />
              Little things, big joy
            </p>

            <h1 className="max-w-full break-words text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-black">
              Find your new
              <br />
              <span className="font-normal">everyday favorite.</span>
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-neutral-600 sm:mt-6 sm:text-base sm:leading-7">
              Cute, thoughtful finds for your space and your everyday. Pick
              something that makes you smile.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center gap-4 bg-black px-7 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
              >
                Shop the collection
                <span aria-hidden="true" className="text-base leading-none">↗</span>
              </Link>
              <Link
                href="#new-arrivals"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition-colors hover:text-black"
              >
                Explore new arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8">
        {/* ====================================================== */}
        {/* NEW ARRIVALS                                          */}
        {/* ====================================================== */}

        <section id="new-arrivals" className="mt-12 scroll-mt-24">
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

          {productsError ? (
            <p role="status" className="mt-6 text-secondary">Products could not be loaded. Please refresh and try again.</p>
          ) : products.length === 0 ? (
            <p className="mt-6 text-secondary">No products yet. Check back soon!</p>
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

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchProductBySlug } from "@/lib/shop/queries";
import { formatDate } from "@/lib/shop/format";
import { AddToCartForm } from "@/components/shop/add-to-cart-form";
import { ProductGallery } from "@/components/shop/product-gallery";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const product = await fetchProductBySlug(supabase, slug);

  if (!product) notFound();

  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const variants = (product.product_variants ?? []).filter((v) => v.is_active);
  const approvedReviews = (product.reviews ?? []).filter(
    (r) => r.status === "approved"
  );
  const avgRating = approvedReviews.length
    ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
      approvedReviews.length
    : null;

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-12 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* ── Left Column: Image Gallery ── */}
        <div className="md:col-span-6 flex flex-col gap-3">
          <ProductGallery
            images={images.map((img) => ({
              id: img.id,
              url: img.image_url,
            }))}
            productName={product.name}
          />
        </div>

        {/* ── Right Column: Product Details & Actions ── */}
        <div className="md:col-span-6 flex flex-col justify-start space-y-4 pt-0">
          {/* Header & classification */}
          <div className="space-y-1.5 pb-2 border-b border-outline-variant/60">
            {product.brand && (
              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-secondary">
                {(product.brand as { name: string }).name}
              </span>
            )}
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-snug ">
      {product.name}
    </h1>
            {avgRating !== null && (
              <p className="text-sm text-secondary">
                ⭐ {avgRating.toFixed(1)} ({approvedReviews.length}{" "}
                {approvedReviews.length === 1 ? "review" : "reviews"})
              </p>
            )}
          </div>

          

          {/* Add to Cart form (variant select, qty, button) */}
          <AddToCartForm
            productId={product.id}
            productName={product.name}
            productImageUrl={images[0]?.image_url ?? null}
            variants={variants}
          />

          {/* Micro details */}
          <div className="pt-3 border-t border-outline-variant/60 grid grid-cols-2 gap-3 text-secondary">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium  ">
                Authentic Product
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.948c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75"
                />
              </svg>
              <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-medium ">
                Fast Delivery
              </span>
            </div>
          </div>

          {/* Full description */}
          {product.description && (
            <div className="pt-3 border-t border-outline-variant/60">
              <h2 className="text-[10px] uppercase tracking-wider text-secondary font-medium mb-2 ">
                Description
              </h2>
              <p className="whitespace-pre-line text-sm text-on-surface-variant leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews Section ── */}
      {approvedReviews.length > 0 && (
        <section className="mt-12 border-t border-outline-variant/60 pt-8">
          <h2 className="text-2xl font-medium uppercase tracking-tight text-foreground">
            Reviews
          </h2>
          <div className="mt-4 space-y-4">
            {approvedReviews.map((review) => {
              const reviewer = review.profiles as unknown as {
                full_name: string | null;
              } | null;
              return (
                <div
                  key={review.id}
                  className="bg-surface-lowest p-4 shadow-sm border border-outline-variant/40"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">
                      {reviewer?.full_name ?? "Anonymous"}
                    </span>
                    <span className="text-secondary">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">
                    {"⭐".repeat(review.rating)}
                  </p>
                  {review.comment && (
                    <p className="mt-2 text-sm text-on-surface-variant">
                      {review.comment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}

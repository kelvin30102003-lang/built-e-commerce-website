"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { formatMmk } from "@/lib/shop/format";
import { addToCartAction } from "@/lib/actions/cart";
import { setWishlistItemAction } from "@/lib/actions/wishlist";
import { showCartAddedToast } from "@/components/shop/cart-added-toast";

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  short_description?: string | null;

  product_images?: {
    image_url: string;
    sort_order: number;
  }[] | null;

  product_variants?: {
    id: number;
    price: number;
    compare_price: number | null;
    is_active: boolean;
    stock_quantity?: number;
  }[] | null;
}

export function ProductCard({
  product,
  initiallyWishlisted = false,
}: {
  product: ProductCardData;
  initiallyWishlisted?: boolean;
}) {
  const router = useRouter();

  const [isWishlisted, setIsWishlisted] = useState(initiallyWishlisted);
  const [isPending, startTransition] = useTransition();
  const [isWishlistPending, startWishlistTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  // Sort product images
  const images = [...(product.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  // Get active variants
  const activeVariants = (product.product_variants ?? []).filter(
    (variant) => variant.is_active
  );

  // Find lowest price variant
  const lowestVariant = activeVariants.length
    ? activeVariants.reduce(
        (min, variant) =>
          variant.price < min.price ? variant : min,
        activeVariants[0]
      )
    : null;

  const lowestPrice = lowestVariant?.price ?? null;
  const comparePrice = lowestVariant?.compare_price ?? null;

  // Stock check
  const isOutOfStock =
    !lowestVariant ||
    (lowestVariant.stock_quantity !== undefined &&
      lowestVariant.stock_quantity <= 0);

  // Discount calculation
  const discountPercent =
    lowestPrice !== null &&
    comparePrice !== null &&
    comparePrice > lowestPrice
      ? Math.round(
          ((comparePrice - lowestPrice) / comparePrice) * 100
        )
      : null;

  // Wishlist
  const handleWishlistToggle = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlistPending) return;
    const shouldAdd = !isWishlisted;
    startWishlistTransition(async () => {
      const result = await setWishlistItemAction(product.id, shouldAdd);
      if ("error" in result && result.error) {
        setMessage(result.error);
        if (result.error.toLowerCase().includes("log in")) {
          router.push(`/login?redirect=${encodeURIComponent(`/products/${product.slug}`)}`);
        }
        return;
      }
      const isSaved = result.isWishlisted ?? shouldAdd;
      setIsWishlisted(isSaved);
      setMessage(isSaved ? "Added to wishlist!" : "Removed from wishlist.");
      router.refresh();
      setTimeout(() => setMessage(null), 2000);
    });
  };

  // Add to cart
  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!lowestVariant || isOutOfStock || isPending) {
      return;
    }

    setMessage(null);

    const formData = new FormData();

    formData.set("productId", String(product.id));
    formData.set("variantId", String(lowestVariant.id));
    formData.set("quantity", "1");

    startTransition(async () => {
      const result = await addToCartAction(formData);

      if (result.error) {
        setMessage(result.error);

        if (result.error.toLowerCase().includes("log in")) {
          router.push(
            `/login?redirect=/products/${product.slug}`
          );
        }

        return;
      }

      setMessage("Added to cart!");
      showCartAddedToast({
        name: product.name,
        imageUrl: images[0]?.image_url ?? null,
        quantity: 1,
      });

      setTimeout(() => {
        setMessage(null);
      }, 2000);
    });
  };

  return (
    <article
      className="
        group
        relative
        flex
        w-full
        flex-col
        overflow-hidden

        border-2
        border-black

        bg-white
        text-black

        shadow-[6px_6px_0px_#202126]

        transition-transform
        duration-200

        hover:-translate-y-1
      "
    >
      {/* =========================
          DISCOUNT BADGE
      ========================== */}
      {discountPercent !== null && (
        <span
          className="
            absolute
            left-3
            top-3
            z-20

            bg-black
            px-2
            py-1

            font-mono
            text-[10px]
            font-bold
            tracking-wider

            text-white
          "
        >
          -{discountPercent}%
        </span>
      )}

      {/* =========================
          WISHLIST BUTTON
      ========================== */}
      <button
        type="button"
        onClick={handleWishlistToggle}
        disabled={isWishlistPending}
        aria-pressed={isWishlisted}
        aria-label={
          isWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }
        className={`
          absolute
          right-3
          top-3
          z-20

          flex
          h-8
          w-8
          items-center
          justify-center

          rounded-full
          bg-white/90
          shadow-sm
          transition-transform
          hover:scale-110
          hover:text-rose-600
          active:scale-95
          disabled:opacity-60
          ${isWishlisted ? "text-rose-600" : "text-black"}
        `}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isWishlisted ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path
            d="
              M19 14
              c1.49-1.46 3-3.21 3-5.5
              A5.5 5.5 0 0 0 16.5 3
              c-1.76 0-3 .5-4.5 2
              -1.5-1.5-2.74-2-4.5-2
              A5.5 5.5 0 0 0 2 8.5
              c0 2.3 1.5 4.05 3 5.5
              l7 7Z
            "
          />
        </svg>
      </button>

      {/* =========================
          PRODUCT IMAGE
      ========================== */}
      <Link
        href={`/products/${product.slug}`}
        className="block w-full"
      >
        <div
          className="
            relative
            aspect-[4/5]
            w-full
            overflow-hidden

            border-b-2
            border-black

            bg-[#FAFAF8]
          "
        >
          {images[0] ? (
            <Image
              src={images[0].image_url}
              alt={product.name}
              fill
              sizes="
                (min-width: 1280px) 25vw,
                (min-width: 768px) 33vw,
                50vw
              "
              className="
                object-contain
                p-3
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                items-center
                justify-center

                font-mono
                text-xs
                font-bold

                text-gray-400
              "
            >
              NO IMAGE
            </div>
          )}
        </div>
      </Link>

      {/* =========================
          PRODUCT DETAILS
      ========================== */}
      <div className="flex flex-1 flex-col p-3 sm:p-5">
        {/* Product Name */}
        <Link
          href={`/products/${product.slug}`}
          className="block"
        >
          <h3
            className="
              line-clamp-2
              min-h-[38px] sm:min-h-[44px]

              font-mono
              text-sm sm:text-lg
              font-bold
              uppercase
              leading-tight
              tracking-wide

              text-black
            "
          >
            {product.name}
          </h3>
        </Link>

        {/* Dashed Divider */}
        <div
          className="
            my-3 sm:my-5
            border-t-2
            border-dashed
            border-black
          "
        />

        {/* Price + Add Button */}
        <div
          className="
            flex
            items-end
            justify-between
            gap-3
          "
        >
          {/* Price */}
          <div>
            <p
              className="
                mb-1

                font-mono
                text-[10px]
                font-bold
                uppercase
                tracking-wider

                text-gray-500
              "
            >
              Price
            </p>

            <div className="flex flex-col">
              <span
                className="
                  font-mono
                  text-base sm:text-xl
                  font-bold
                  leading-none

                  text-black
                "
              >
                {lowestPrice !== null
                  ? formatMmk(lowestPrice)
                  : "N/A"}
              </span>

              {/* Old Price */}
              {comparePrice !== null &&
                lowestPrice !== null &&
                comparePrice > lowestPrice && (
                  <span
                    className="
                      mt-1

                      font-mono
                      text-xs

                      text-gray-400
                      line-through
                    "
                  >
                    {formatMmk(comparePrice)}
                  </span>
                )}
            </div>
          </div>

          {/* Add To Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isPending || isOutOfStock}
            className="
              shrink-0

              border-2
              border-black

              bg-black

              px-2 sm:px-4
              py-2.5 sm:py-3

              font-mono
              text-[10px] sm:text-xs
              font-bold
              uppercase

              text-white

              transition-all

              hover:bg-white
              hover:text-black

              active:translate-x-[2px]
              active:translate-y-[2px]

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isPending
              ? "..."
              : isOutOfStock
                ? "SOLD OUT"
                : "+ ADD"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`
              mt-3

              font-mono
              text-[10px]
              font-bold
              uppercase
              tracking-wide

              ${
                message === "Added to cart!" ||
                message === "Added to wishlist!" ||
                message === "Removed from wishlist."
                  ? "text-black"
                  : "text-red-500"
              }
            `}
          >
            {message}
          </p>
        )}
      </div>
    </article>
  );
}

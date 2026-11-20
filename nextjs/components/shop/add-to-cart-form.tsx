"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMmk } from "@/lib/shop/format";
import { addToCartAction } from "@/lib/actions/cart";
import { showCartAddedToast } from "@/components/shop/cart-added-toast";

interface Variant {
  id: number;
  variant_name: string | null;
  price: number;
  compare_price: number | null;
  stock_quantity: number;
}

export function AddToCartForm({
  productId,
  productName,
  productImageUrl,
  variants,
}: {
  productId: number;
  productName: string;
  productImageUrl: string | null;
  variants: Variant[];
}) {
  const [variantId, setVariantId] = useState<number | null>(
    variants[0]?.id ?? null
  );

  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const selected = variants.find((v) => v.id === variantId);

  const stock = selected?.stock_quantity ?? 0;
  const outOfStock = !selected || stock <= 0;

  /*
   * Keep quantity inside available stock.
   */
  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    if (!selected) return;

    setQuantity((current) =>
      Math.min(selected.stock_quantity, current + 1)
    );
  }

  /*
   * Change variant.
   * Reset quantity to 1 when selected variant changes.
   */
  function handleVariantChange(value: string) {
    const newVariantId = Number(value);

    setVariantId(newVariantId);
    setQuantity(1);
    setMessage(null);
  }

  /*
   * Add product to cart.
   */
  function addProductToCart(onSuccess?: () => void) {
    if (!selected || outOfStock || !variantId) return;

    setMessage(null);

    const formData = new FormData();

    formData.set("productId", String(productId));
    formData.set("variantId", String(variantId));
    formData.set("quantity", String(quantity));

    startTransition(async () => {
      const result = await addToCartAction(formData);

      if (result.error) {
        setMessage(result.error);

        if (result.error.includes("log in")) {
          router.push(`/login?redirect=/products`);
        }

        return;
      }

      setMessage("Added to cart!");
      showCartAddedToast({ name: productName, imageUrl: productImageUrl, quantity });

      onSuccess?.();
    });
  }

  /*
   * Add to cart.
   */
  function handleAddToCart(e: React.FormEvent) {
    e.preventDefault();

    addProductToCart();
  }

  /*
   * Buy Now.
   *
   * Currently adds the item to cart and then goes to checkout.
   * If your checkout route is different, change "/checkout".
   */
  function handleBuyNow() {
    addProductToCart(() => {
      router.push("/checkout");
    });
  }

  return (
    <form
      onSubmit={handleAddToCart}
      className="mt-5 flex w-full flex-col gap-5"
    >
      {/* =========================================================
          PRICE
      ========================================================== */}
      {selected && (
        <div className="flex items-baseline gap-3">
          <p className="text-2xl font-semibold text-primary ">
            {formatMmk(selected.price)}
          </p>

          {selected.compare_price &&
            selected.compare_price > selected.price && (
              <span className="text-base font-normal text-secondary line-through ">
                {formatMmk(selected.compare_price)}
              </span>
            )}
        </div>
      )}
      {/* =========================================================
          VARIANT
      ========================================================== */}
      {variants.length > 1 && (
        <div className="flex flex-col gap-2">
          <label
            htmlFor="product-variant"
            className="text-[11px] font-semibold uppercase tracking-label text-secondary "
          >
            Variant
          </label>

          <select
            id="product-variant"
            value={variantId ?? ""}
            onChange={(e) => handleVariantChange(e.target.value)}
            className="
              h-12
              w-full
              rounded-md
              border
              border-outline-variant
              bg-surface-low
              px-3
              text-sm
              text-foreground
              outline-none
              transition-colors
              focus:border-primary
              focus:bg-surface-lowest
            "
          >
            {variants.map((variant) => (
              <option
                key={variant.id}
                value={variant.id}
                disabled={variant.stock_quantity <= 0}
              >
                {variant.variant_name || "Default"}
                {variant.stock_quantity <= 0 ? " (Out of stock)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* =========================================================
          STOCK + QUANTITY
      ========================================================== */}
      <div className="flex items-center justify-between pt-1">
        {/* Available stock */}
        <span className="text-sm text-secondary ">
          (Available Stock: {stock})
        </span>

        {/* Quantity control */}
        <div
          className="
            flex
            h-11
            items-center
            rounded-full
            border
            border-outline-variant
            bg-background
            px-1
          "
        >
          {/* Minus */}
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={outOfStock || quantity <= 1 || isPending}
            aria-label="Decrease quantity"
            className="
              flex
              h-9
              w-10
              items-center
              justify-center
              rounded-full
              text-lg
              text-secondary
              transition-colors
              hover:bg-surface-low
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            −
          </button>

          {/* Quantity */}
          <span
            className="
              min-w-[34px]
              text-center
              text-sm
              font-medium
              text-foreground
            "
          >
            {quantity}
          </span>

          {/* Plus */}
          <button
            type="button"
            onClick={increaseQuantity}
            disabled={
              outOfStock ||
              quantity >= stock ||
              isPending
            }
            aria-label="Increase quantity"
            className="
              flex
              h-9
              w-10
              items-center
              justify-center
              rounded-full
              text-lg
              text-secondary
              transition-colors
              hover:bg-surface-low
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            +
          </button>
        </div>
      </div>

      {/* =========================================================
          ACTION BUTTONS
      ========================================================== */}
      <div
        className="
    grid
    w-full
    grid-cols-2
    gap-3
  "
      >


        {/* -------------------------------------------------------
            ADD TO CART
        -------------------------------------------------------- */}
        <button
          type="submit"
          disabled={outOfStock || isPending}
          className="
            flex
            h-14
            min-w-0
            items-center
            justify-center
            gap-2
            rounded-lg
            border-2
            border-primary
            bg-background
            px-3
            text-sm
            font-medium
            text-primary
            transition-colors
            hover:bg-primary
            hover:text-primary-foreground
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {/* Cart icon */}
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13 5.4 5M7 13l-2 4h13m-9 0a1.5 1.5 0 1 0 3 0m4 0a1.5 1.5 0 1 0 3 0"
            />
          </svg>

          <span className="truncate">
            {outOfStock
              ? "Out of Stock"
              : isPending
                ? "Adding..."
                : "Add to Cart"}
          </span>
        </button>

        {/* -------------------------------------------------------
            BUY NOW
        -------------------------------------------------------- */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={outOfStock || isPending}
          className="
            flex
            h-14
            min-w-0
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-primary
            px-3
            text-sm
            font-medium
            text-primary-foreground
            shadow-sm
            transition-opacity
            hover:opacity-90
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {/* Bag icon */}
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 8h14l1 12H4L5 8Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 8a4 4 0 0 1 8 0"
            />
          </svg>

          <span className="truncate ">
            Buy Now
          </span>
        </button>
      </div>

      {/* =========================================================
          MESSAGE
      ========================================================== */}
      {message && (
        <p
          className={`text-sm ${message === "Added to cart!"
            ? "text-primary"
            : "text-secondary"
            }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

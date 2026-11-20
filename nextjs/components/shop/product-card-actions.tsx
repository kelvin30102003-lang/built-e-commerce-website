"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { addToCartAction } from "@/lib/actions/cart";
import { setWishlistItemAction } from "@/lib/actions/wishlist";
import { showCartAddedToast } from "@/components/shop/cart-added-toast";

export function ProductWishlistButton({
  productId,
  productSlug,
  initiallyWishlisted,
}: {
  productId: number;
  productSlug: string;
  initiallyWishlisted: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isWishlisted, setIsWishlisted] = useState(initiallyWishlisted);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (isPending) return;

    const shouldAdd = !isWishlisted;
    startTransition(async () => {
      const result = await setWishlistItemAction(productId, shouldAdd);
      if ("error" in result && result.error) {
        setMessage(result.error);
        if (result.error.toLowerCase().includes("log in")) {
          router.push(`/login?redirect=${encodeURIComponent(`/products/${productSlug}`)}`);
        }
        window.setTimeout(() => setMessage(null), 2500);
        return;
      }

      const saved = result.isWishlisted ?? shouldAdd;
      setIsWishlisted(saved);
      setMessage(saved ? "Saved to wishlist" : "Removed from wishlist");
      window.setTimeout(() => setMessage(null), 1800);
      if (pathname === "/wishlist") router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        disabled={isPending}
        aria-pressed={isWishlisted}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black shadow-sm transition-transform hover:scale-110 hover:text-neutral-600 active:scale-95 disabled:opacity-60"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>
      {message ? <span role="status" aria-live="polite" className="absolute right-2 top-12 z-30 max-w-40 rounded-md bg-white px-2 py-1 text-right text-[10px] font-semibold text-black shadow">{message}</span> : null}
    </>
  );
}

export function ProductAddToCartButton({
  productId,
  productName,
  productSlug,
  variantId,
  imageUrl,
  isOutOfStock,
}: {
  productId: number;
  productName: string;
  productSlug: string;
  variantId: number | null;
  imageUrl: string | null;
  isOutOfStock: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function add(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!variantId || isOutOfStock || isPending) return;

    setMessage(null);
    const formData = new FormData();
    formData.set("productId", String(productId));
    formData.set("variantId", String(variantId));
    formData.set("quantity", "1");

    startTransition(async () => {
      const result = await addToCartAction(formData);
      if (result.error) {
        setMessage(result.error);
        if (result.error.toLowerCase().includes("log in")) {
          router.push(`/login?redirect=${encodeURIComponent(`/products/${productSlug}`)}`);
        }
        return;
      }

      setMessage("Added to cart!");
      showCartAddedToast({ name: productName, imageUrl, quantity: 1 });
      window.setTimeout(() => setMessage(null), 2000);
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={add}
        disabled={isPending || isOutOfStock}
        className="shrink-0 border-2 border-black bg-black px-2 py-2.5 font-mono text-[10px] font-bold uppercase text-white transition-all hover:bg-white hover:text-black active:translate-x-[2px] active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-3 sm:text-xs"
      >
        {isPending ? "..." : isOutOfStock ? "SOLD OUT" : "+ ADD"}
      </button>
      {message ? <p role="status" aria-live="polite" className={`max-w-36 text-right font-mono text-[10px] font-bold uppercase tracking-wide ${message === "Added to cart!" ? "text-black" : "text-red-500"}`}>{message}</p> : null}
    </div>
  );
}

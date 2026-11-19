"use client";

import { useTransition } from "react";
import { updateCartItemAction, removeCartItemAction } from "@/lib/actions/cart";

export function CartLineControls({
  cartItemId,
  quantity,
  maxQuantity,
}: {
  cartItemId: number;
  quantity: number;
  maxQuantity: number;
}) {
  const [isPending, startTransition] = useTransition();

  function updateQuantity(nextQuantity: number) {
    const formData = new FormData();
    formData.set("cartItemId", String(cartItemId));
    formData.set("quantity", String(nextQuantity));
    startTransition(async () => {
      await updateCartItemAction(formData);
    });
  }

  function removeItem() {
    const formData = new FormData();
    formData.set("cartItemId", String(cartItemId));
    startTransition(async () => {
      await removeCartItemAction(formData);
    });
  }

  return (
    <div className="mt-2 flex items-center gap-4 text-sm">
      <div className="inline-flex items-center bg-surface-lowest shadow-sm">
        <button
          type="button"
          disabled={isPending}
          onClick={() => quantity <= 1 ? removeItem() : updateQuantity(quantity - 1)}
          className="flex h-9 w-9 items-center justify-center text-primary transition-colors hover:bg-surface-high disabled:opacity-40"
          aria-label={quantity <= 1 ? "Remove item from cart" : "Decrease quantity"}
        >
          −
        </button>
        <span className="w-9 select-none text-center font-medium text-primary">{quantity}</span>
        <button
          type="button"
          disabled={isPending || quantity >= maxQuantity}
          onClick={() => updateQuantity(quantity + 1)}
          className="flex h-9 w-9 items-center justify-center text-primary transition-colors hover:bg-surface-high disabled:opacity-40"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={removeItem}
        className="flex h-9 w-9 items-center justify-center text-secondary transition-colors hover:text-error disabled:opacity-40"
        aria-label="Remove item from cart"
        title="Remove item"
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2m-10 0 1 14h10l1-14M10 10v6m4-6v6" />
        </svg>
      </button>
    </div>
  );
}

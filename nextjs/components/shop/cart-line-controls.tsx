"use client";

import { useState, useTransition } from "react";
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
  const [message, setMessage] = useState<string | null>(null);

  function updateQuantity(nextQuantity: number) {
    setMessage(null);
    const formData = new FormData();
    formData.set("cartItemId", String(cartItemId));
    formData.set("quantity", String(nextQuantity));
    startTransition(async () => {
      const result = await updateCartItemAction(formData);
      if (result.error) setMessage(result.error);
    });
  }

  function removeItem() {
    setMessage(null);
    const formData = new FormData();
    formData.set("cartItemId", String(cartItemId));
    startTransition(async () => {
      const result = await removeCartItemAction(formData);
      if (result.error) setMessage(result.error);
    });
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
      {maxQuantity > 0 ? <div className="inline-flex items-center bg-surface-lowest shadow-sm">
        <button
          type="button"
          disabled={isPending}
          onClick={() => quantity <= 1 ? removeItem() : updateQuantity(Math.min(quantity - 1, maxQuantity))}
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
      </div> : <span className="text-xs font-medium text-error">Out of stock</span>}
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
      {message ? <span role="alert" className="w-full text-xs text-error">{message}</span> : null}
    </div>
  );
}

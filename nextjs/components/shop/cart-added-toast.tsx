"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface CartAddedProduct {
  name: string;
  imageUrl: string | null;
  quantity: number;
}

export function showCartAddedToast(product: CartAddedProduct) {
  window.dispatchEvent(new CustomEvent<CartAddedProduct>("cart:item-added", { detail: product }));
}

export function CartAddedToast() {
  const [product, setProduct] = useState<CartAddedProduct | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const handleItemAdded = (event: Event) => {
      const addedProduct = (event as CustomEvent<CartAddedProduct>).detail;
      setProduct(addedProduct);
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => setProduct(null), 5000);
    };

    window.addEventListener("cart:item-added", handleItemAdded);
    return () => {
      window.removeEventListener("cart:item-added", handleItemAdded);
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  if (!product) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4 sm:justify-end sm:px-8" aria-live="polite">
      <Link
        href="/cart"
        aria-label={`View cart: ${product.name}, quantity ${product.quantity}`}
        className="pointer-events-auto flex w-full max-w-sm items-center gap-3 border-2 border-black bg-white p-3 text-black shadow-[5px_5px_0px_#202126] animate-[cart-toast-in_180ms_ease-out]"
      >
        <span className="relative h-16 w-16 shrink-0 overflow-hidden border border-black bg-surface-low">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill sizes="64px" unoptimized className="object-contain p-1" />
          ) : (
            <span className="flex h-full items-center justify-center text-[9px] font-bold text-secondary">NO IMAGE</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-semibold uppercase tracking-label text-secondary ">Added to cart</span>
          <span className="mt-1 block truncate text-sm font-semibold">{product.name}</span>
          <span className="mt-1 block text-xs text-secondary">Quantity: {product.quantity} · Tap to view cart</span>
        </span>
        <span aria-hidden="true" className="text-xl leading-none">›</span>
      </Link>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCartDetails } from "@/lib/shop/cart";
import { formatMmk } from "@/lib/shop/format";
import { CartLineControls } from "@/components/shop/cart-line-controls";

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/guest-session?redirect=/cart");

  const cart = await fetchCartDetails(supabase, user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="flex items-baseline gap-4 border-b border-surface-dim pb-4">
        <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground sm:text-4xl">
          Shopping Bag
        </h1>
        <span className="font-light text-secondary">({cart.items.length} items)</span>
      </div>

      {cart.items.length === 0 ? (
        <div className="mt-8 bg-surface-lowest p-8 text-center shadow-sm">
          <p className="text-secondary">Your cart is empty.</p>
          <Link href="/shop" className="mt-4 inline-block text-primary underline underline-offset-4 hover:text-secondary">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          <div className="flex flex-col gap-3 lg:col-span-8">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-surface-lowest p-4 shadow-sm">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-surface-container">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.productName} fill sizes="80px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/products/${item.slug}`} className="font-medium text-foreground hover:text-secondary">
                    {item.productName}
                  </Link>
                  {item.variantName && (
                    <p className="text-[11px] font-semibold uppercase tracking-label text-secondary">
                      {item.variantName}
                    </p>
                  )}
                  <p className="mt-1 font-semibold text-primary">{formatMmk(item.unitPrice)}</p>
                  <CartLineControls cartItemId={item.id} quantity={item.quantity} maxQuantity={item.stockQuantity} />
                </div>
                <p className="font-semibold text-primary">{formatMmk(item.lineTotal)}</p>
              </div>
            ))}
          </div>

          <div className="bg-surface-lowest p-6 shadow-sm lg:sticky lg:top-24 lg:col-span-4">
            <span className="text-[11px] font-semibold uppercase tracking-label text-secondary">Ledger</span>
            <h2 className="text-lg font-medium uppercase tracking-tight text-foreground">Order Summary</h2>
            <div className="mt-4 flex justify-between text-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">{formatMmk(cart.subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-secondary">Shipping calculated at checkout.</p>
            <Link
              href="/checkout"
              className="mt-6 block bg-primary px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-label-wide text-primary-foreground transition-colors hover:bg-surface-highest hover:text-foreground"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

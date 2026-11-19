import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchCartDetails } from "@/lib/shop/cart";
import { CheckoutForm } from "@/components/shop/checkout-form";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/guest-session?redirect=/checkout");

  const cart = await fetchCartDetails(supabase, user.id);
  if (cart.items.length === 0) redirect("/cart");

  const { data: paymentMethods } = await supabase
    .from("payment_methods")
    .select("code, name, account_name, account_phone, account_number, qr_image_url, instructions")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const availablePaymentMethods = user.is_anonymous
    ? (paymentMethods ?? []).filter((method) => method.code === "cod")
    : (paymentMethods ?? []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground sm:text-4xl">
        Checkout
      </h1>
      <CheckoutForm cart={cart} paymentMethods={availablePaymentMethods} />
    </div>
  );
}

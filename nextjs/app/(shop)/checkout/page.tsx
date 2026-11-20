import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/get-current-profile";
import { fetchCartDetails } from "@/lib/shop/cart";
import { CheckoutForm } from "@/components/shop/checkout-form";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) redirect("/guest-session?redirect=/checkout");

  const [cart, { data: paymentMethods }, { data: savedAddress }] = await Promise.all([
    fetchCartDetails(supabase, user.id),
    supabase
      .from("payment_methods")
      .select("code, name, account_name, account_phone, account_number, qr_image_url, instructions")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    user.is_anonymous
      ? Promise.resolve({ data: null })
      : supabase
          .from("addresses")
          .select("full_name, phone, address_line1, township")
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle(),
  ]);
  if (cart.items.length === 0) redirect("/cart");

  const availablePaymentMethods = user.is_anonymous
    ? (paymentMethods ?? []).filter((method) => method.code === "cod")
    : (paymentMethods ?? []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground sm:text-4xl">
        Checkout
      </h1>
      <CheckoutForm cart={cart} paymentMethods={availablePaymentMethods} savedAddress={savedAddress} />
    </div>
  );
}

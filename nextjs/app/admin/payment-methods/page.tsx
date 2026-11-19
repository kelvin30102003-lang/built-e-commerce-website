import { createClient } from "@/lib/supabase/server";
import { PaymentMethodCard } from "@/components/admin/payment-method-card";

export default async function AdminPaymentMethodsPage() {
  const supabase = await createClient();

  const { data: methods } = await supabase
    .from("payment_methods")
    .select(
      "code, name, account_name, account_phone, account_number, qr_image_url, instructions, is_active, sort_order"
    )
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Payment Methods
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Manage QR codes and account details for each payment method. Changes
          are immediately reflected on the checkout page.
        </p>
      </div>

      {(methods ?? []).length === 0 ? (
        <div className="bg-surface-lowest p-8 text-center shadow-sm">
          <p className="text-sm text-secondary">
            No payment methods found. Add them in the{" "}
            <code className="text-foreground">payment_methods</code> table.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {(methods ?? []).map((method) => (
            <PaymentMethodCard key={method.code} method={method} />
          ))}
        </div>
      )}
    </div>
  );
}


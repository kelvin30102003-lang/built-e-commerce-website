import { createClient } from "@/lib/supabase/server";
import { PaymentMethodCard } from "@/components/admin/payment-method-card";
import { requireAdminCapability } from "@/lib/auth/require-admin";
import { ErrorMessage } from "@/components/admin/ErrorMessage";

export default async function AdminPaymentMethodsPage() {
  await requireAdminCapability("orders");
  const supabase = await createClient();

  const { data: methods, error } = await supabase
    .from("payment_methods")
    .select(
      "code, name, account_name, account_phone, account_number, qr_image_url, instructions, is_active, sort_order"
    )
    .order("sort_order", { ascending: true });
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Payment Methods
        </h1>
        <p className="mt-1 text-sm text-secondary">
          Activate or deactivate checkout options, and manage QR codes and
          account details for each payment method.
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


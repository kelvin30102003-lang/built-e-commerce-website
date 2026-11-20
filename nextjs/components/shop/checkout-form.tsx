
"use client";

import { useState, useTransition, type ChangeEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { formatMmk } from "@/lib/shop/format";
import {
  SHIPPING_METHODS,
  isManualPaymentMethod,
  type ShippingMethodKey,
  YANGON_TOWNSHIPS,
} from "@/lib/shop/constants";
import { placeOrderAction } from "@/lib/actions/checkout";
import type { CartDetails } from "@/lib/shop/cart";

interface PaymentMethod {
  code: string;
  name: string;
  account_name: string | null;
  account_phone: string | null;
  account_number: string | null;
  qr_image_url: string | null;
  instructions: string | null;
}

interface SavedAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  township: string | null;
}

export function CheckoutForm({
  cart,
  paymentMethods,
  savedAddress,
}: {
  cart: CartDetails;
  paymentMethods: PaymentMethod[];
  savedAddress: SavedAddress | null;
}) {
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodKey>("standard");

  const [paymentMethod, setPaymentMethod] = useState(
    paymentMethods[0]?.code ?? "cod"
  );

  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  const router = useRouter();

  const shippingFee = SHIPPING_METHODS[shippingMethod].fee;
  const total = cart.subtotal + shippingFee;

  const manual = isManualPaymentMethod(paymentMethod);

  const selectedMethod = paymentMethods.find(
    (m) => m.code === paymentMethod
  );

  function handleSubmit(formData: FormData) {
    setError(null);

    formData.set("shippingMethod", shippingMethod);
    formData.set("paymentMethod", paymentMethod);

    startTransition(async () => {
      try {
        const result = await placeOrderAction(formData);

        if (result.error) {
          setError(result.error);
          return;
        }

        if (!result.orderNumber) {
          setError("We couldn't confirm your order. Please refresh your orders before trying again.");
          return;
        }

        router.push(`/orders/${result.orderNumber}`);
      } catch {
        setError("We couldn't place your order because of a connection problem. Please try again.");
      }
    });
  }

  function handleSlipChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSlipPreview(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSlipPreview(previewUrl);
  }

  function removeSlip() {
    setSlipPreview(null);

    const input = document.getElementById(
      "slipImage"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  return (
    <form
      action={handleSubmit}
      className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start"
    >
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-6 lg:col-span-7">
        {/* SHIPPING ADDRESS */}
        <section className="flex flex-col gap-4 bg-surface-lowest p-6 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-label text-secondary">
            Shipping Address
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" name="fullName" required defaultValue={savedAddress?.full_name ?? ""} />

            <Field label="Phone" name="phone" required defaultValue={savedAddress?.phone ?? ""} />

            <Field
              label="Address line 1"
              name="addressLine1"
              required
              defaultValue={savedAddress?.address_line1 ?? ""}
              className="sm:col-span-2"
            />

            <SelectField label="Township" name="township" required defaultValue={savedAddress?.township ?? ""}>
              <option value="">Select township</option>
              {YANGON_TOWNSHIPS.map((township) => (
                <option key={township} value={township}>{township}</option>
              ))}
            </SelectField>

            <SelectField label="State/Region" name="state" required>
              <option value="Yangon">Yangon</option>
            </SelectField>

            <input type="hidden" name="city" value="Yangon" />

            <input
              type="hidden"
              name="country"
              value="Myanmar"
            />
          </div>
        </section>

        {/* SHIPPING METHOD */}
        <section className="flex flex-col gap-4 bg-surface-lowest p-6 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-label text-secondary">
            Shipping Method
          </h2>

          <div className="flex flex-col gap-2">
            {Object.entries(SHIPPING_METHODS).map(([key, method]) => (
              <label
                key={key}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-3 transition-colors ${shippingMethod === key
                    ? "bg-surface-container"
                    : "bg-surface-low hover:bg-surface-container"
                  }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shippingMethodRadio"
                    checked={shippingMethod === key}
                    onChange={() =>
                      setShippingMethod(key as ShippingMethodKey)
                    }
                  />

                  <span className="text-foreground">
                    {method.label}
                  </span>
                </span>

                <span className="font-medium text-foreground">
                  {formatMmk(method.fee)}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* PAYMENT METHOD */}
        <section className="flex flex-col gap-5 bg-surface-lowest p-6 shadow-sm">
          <h2 className="text-[11px] font-semibold uppercase tracking-label text-secondary">
            Payment Method
          </h2>

          {/* PAYMENT METHODS */}
          <div className="flex flex-col gap-2">
            {paymentMethods.map((method) => (
              <label
                key={method.code}
                className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${paymentMethod === method.code
                    ? "bg-surface-container"
                    : "bg-surface-low hover:bg-surface-container"
                  }`}
              >
                <input
                  type="radio"
                  name="paymentMethodRadio"
                  checked={paymentMethod === method.code}
                  onChange={() =>
                    setPaymentMethod(method.code)
                  }
                />

                <span className="text-foreground">
                  {method.name}
                </span>
              </label>
            ))}
            {paymentMethods.length === 0 && (
              <p className="bg-error/5 px-4 py-3 text-sm text-error">
                Payment methods are unavailable right now. Please refresh the page or try again later.
              </p>
            )}
          </div>

          {/* MANUAL PAYMENT */}
          {manual && selectedMethod && (
            <div className="mt-2 flex flex-col gap-6">
              {/* PAYMENT CARD */}
              <div className="overflow-hidden border border-surface-dim bg-surface-low">
                {/* HEADER */}
                <div className="border-b border-surface-dim bg-surface-container px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-label text-secondary">
                        Payment
                      </p>

                      <h3 className="mt-1 text-base font-semibold text-foreground">
                        {selectedMethod.name}
                      </h3>
                    </div>

                    <div className="rounded-full bg-surface-lowest px-3 py-1 text-[10px] font-semibold uppercase tracking-label text-secondary">
                      Manual Payment
                    </div>
                  </div>
                </div>

                {/* PAYMENT DETAILS */}
                <div className="flex flex-col gap-5 p-5">
                  {/* QR CODE */}
                  {selectedMethod.qr_image_url && (
                    <div className="flex flex-col items-center">
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-label text-secondary">
                        Scan QR to Pay
                      </p>

                      <div className="rounded-2xl border border-surface-dim bg-white p-4 shadow-sm">
                        <img
                          src={selectedMethod.qr_image_url}
                          alt={`${selectedMethod.name} QR Code`}
                          className="h-56 w-56 object-contain sm:h-64 sm:w-64"
                        />
                      </div>

                      <p className="mt-3 text-center text-xs text-on-surface-variant">
                        Scan this QR code using your banking app
                      </p>
                    </div>
                  )}

                  {/* ACCOUNT INFORMATION */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedMethod.account_name && (
                      <PaymentInfo
                        label="Account Name"
                        value={selectedMethod.account_name}
                      />
                    )}

                    {selectedMethod.account_number && (
                      <PaymentInfo
                        label="Account Number"
                        value={selectedMethod.account_number}
                      />
                    )}

                    {selectedMethod.account_phone && (
                      <PaymentInfo
                        label="Phone Number"
                        value={selectedMethod.account_phone}
                        copyable
                      />
                    )}
                  </div>

                  {/* TOTAL */}
                  <div className="flex items-center justify-between border-t border-surface-dim pt-4">
                    <span className="text-sm text-on-surface-variant">
                      Amount to Pay
                    </span>

                    <span className="text-lg font-bold text-foreground">
                      {formatMmk(total)}
                    </span>
                  </div>

                  {/* INSTRUCTIONS */}
                  {selectedMethod.instructions && (
                    <div className="bg-surface-container p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-label text-secondary">
                        Payment Instructions
                      </p>

                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-on-surface-variant">
                        {selectedMethod.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* TRANSACTION NUMBER */}
              <div className="flex flex-col gap-3">
                <div>
                  <label
                    htmlFor="transactionId"
                    className="text-[11px] font-semibold uppercase tracking-label text-secondary"
                  >
                    Transaction Number
                  </label>

                  <p className="mt-1 text-xs text-on-surface-variant">
                    Enter the transaction/reference number from your payment.
                  </p>
                </div>

                <input
                  id="transactionId"
                  type="text"
                  name="transactionId"
                  required
                  placeholder="Enter transaction number"
                  className="block w-full border border-surface-dim bg-surface-low px-4 py-3.5 text-sm text-foreground placeholder:text-on-surface-variant/60 focus:border-foreground focus:bg-surface-container-low focus:outline-none"
                />
              </div>

              {/* PAYMENT SLIP */}
              <div className="flex flex-col gap-3">
                <div>
                  <label
                    htmlFor="slipImage"
                    className="text-[11px] font-semibold uppercase tracking-label text-secondary"
                  >
                    Payment Screenshot
                  </label>

                  <p className="mt-1 text-xs text-on-surface-variant">
                    Upload a screenshot of your successful payment.
                  </p>
                </div>

                {!slipPreview ? (
                  <label
                    htmlFor="slipImage"
                    className="group flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-surface-dim bg-surface-low px-6 py-10 text-center transition-colors hover:border-foreground hover:bg-surface-container"
                  >
                    {/* UPLOAD ICON */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-xl text-foreground transition-transform group-hover:scale-105">
                      ↑
                    </div>

                    <p className="mt-4 text-sm font-semibold text-foreground">
                      Upload payment screenshot
                    </p>

                    <p className="mt-1 text-xs text-on-surface-variant">
                      Click to browse from your device
                    </p>

                    <p className="mt-3 text-[10px] uppercase tracking-label text-on-surface-variant">
                      JPG, PNG, WEBP
                    </p>

                    <input
                      id="slipImage"
                      type="file"
                      name="slipImage"
                      accept="image/*"
                      required={manual}
                      onChange={handleSlipChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="overflow-hidden border border-surface-dim bg-surface-low">
                    {/* PREVIEW */}
                    <div className="relative">
                      <img
                        src={slipPreview}
                        alt="Payment screenshot preview"
                        className="max-h-[420px] w-full object-contain bg-black/5"
                      />

                      <button
                        type="button"
                        onClick={removeSlip}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-sm text-white transition-colors hover:bg-black"
                        aria-label="Remove payment screenshot"
                      >
                        ×
                      </button>
                    </div>

                    {/* FILE INFO */}
                    <div className="flex items-center justify-between gap-4 border-t border-surface-dim px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          Payment screenshot selected
                        </p>

                        <p className="mt-0.5 text-xs text-on-surface-variant">
                          Ready to upload with your order
                        </p>
                      </div>

                      <label
                        htmlFor="slipImage"
                        className="shrink-0 cursor-pointer text-[10px] font-semibold uppercase tracking-label text-foreground underline underline-offset-4"
                      >
                        Change
                      </label>
                    </div>

                    <input
                      id="slipImage"
                      type="file"
                      name="slipImage"
                      accept="image/*"
                      required={manual}
                      onChange={handleSlipChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ORDER NOTE */}
        <section className="flex flex-col gap-2 bg-surface-lowest p-6 shadow-sm">
          <label className="text-[11px] font-semibold uppercase tracking-label text-secondary">
            Order note (optional)
          </label>

          <textarea
            name="customerNote"
            rows={3}
            placeholder="Anything you want us to know about your order?"
            className="block w-full bg-surface-low px-3 py-3 text-sm text-foreground placeholder:text-on-surface-variant/60 focus:bg-surface-container-low focus:outline-none"
          />
        </section>
      </div>

      {/* RIGHT SIDE - ORDER SUMMARY */}
      <div className="bg-surface-lowest p-6 shadow-sm lg:sticky lg:top-24 lg:col-span-5">
        <h2 className="text-lg font-medium uppercase tracking-tight text-foreground">
          Order Summary
        </h2>

        <div className="mt-4 flex flex-col gap-2 text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <span>Subtotal</span>

            <span className="font-medium text-foreground">
              {formatMmk(cart.subtotal)}
            </span>
          </div>

          <div className="flex justify-between text-on-surface-variant">
            <span>Shipping</span>

            <span className="font-medium text-foreground">
              {formatMmk(shippingFee)}
            </span>
          </div>

          <div className="flex justify-between border-t border-surface-dim pt-2 font-semibold text-foreground">
            <span>Total</span>

            <span>{formatMmk(total)}</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 border border-error/20 bg-error/5 px-4 py-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || paymentMethods.length === 0}
          className="mt-6 w-full bg-primary px-6 py-4 text-[11px] font-semibold uppercase tracking-label-wide text-primary-foreground transition-colors hover:bg-surface-highest hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </form>
  );
}

/* ----------------------------- */
/* FIELD                         */
/* ----------------------------- */

function Field({
  label,
  name,
  required,
  className,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="text-[11px] font-semibold uppercase tracking-label text-secondary"
      >
        {label}
      </label>

      <input
        id={name}
        type="text"
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 block w-full bg-surface-low px-3 py-3 text-sm text-foreground placeholder:text-on-surface-variant/60 focus:bg-surface-container-low focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  required,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[11px] font-semibold uppercase tracking-label text-secondary">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue ?? (name === "state" ? "Yangon" : "")}
        className="mt-1 block w-full bg-surface-low px-3 py-3 text-sm text-foreground focus:bg-surface-container-low focus:outline-none"
      >
        {children}
      </select>
    </div>
  );
}

/* ----------------------------- */
/* PAYMENT INFO                  */
/* ----------------------------- */

function PaymentInfo({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: string;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="bg-surface-container px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-label text-secondary">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="min-w-0 break-all text-sm font-medium text-foreground">{value}</p>
        {copyable && (
          <button
            type="button"
            onClick={copyValue}
            className="shrink-0 text-primary transition-colors hover:text-foreground"
            aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
            title={copied ? "Copied" : "Copy"}
          >
            {copied ? (
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 4 4L19 6" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="8" y="8" width="13" height="13" rx="1.5" />
                <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}


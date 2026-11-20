"use client";

import { useState, useTransition, useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AdminSuccessToast } from "@/components/admin/admin-success-toast";
import {
  updatePaymentMethodQrAction,
  removePaymentMethodQrAction,
  updatePaymentMethodAction,
  setPaymentMethodActiveAction,
} from "@/lib/actions/admin/payment-methods";

interface PaymentMethod {
  code: string;
  name: string;
  account_name: string | null;
  account_phone: string | null;
  account_number: string | null;
  qr_image_url: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
}

export function PaymentMethodCard({ method }: { method: PaymentMethod }) {
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isActive, setIsActive] = useState(method.is_active);
  const [isUploadingQr, startQrTransition] = useTransition();
  const [isSavingDetails, startDetailsTransition] = useTransition();
  const [isRemovingQr, startRemoveTransition] = useTransition();
  const [isTogglingActive, startActiveTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleToggleActive() {
    const nextIsActive = !isActive;
    setMessage(null);
    startActiveTransition(async () => {
      const result = await setPaymentMethodActiveAction(method.code, nextIsActive);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
        return;
      }
      setIsActive(nextIsActive);
      setMessage({
        type: "success",
        text: `${method.name} is now ${nextIsActive ? "active" : "inactive"}.`,
      });
      router.refresh();
    });
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setQrPreview(null);
      return;
    }

    // Client-side validation
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: "Only PNG, JPG, WEBP, and GIF images are allowed.",
      });
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Image must be under 5 MB." });
      e.target.value = "";
      return;
    }

    setMessage(null);
    setQrPreview(URL.createObjectURL(file));
  }

  function cancelQrUpload() {
    setQrPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMessage(null);
  }

  function handleSaveQr() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setMessage(null);
    const formData = new FormData();
    formData.set("qrImage", file);

    startQrTransition(async () => {
      const result = await updatePaymentMethodQrAction(method.code, formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "QR code updated successfully!" });
        setQrPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    });
  }

  function handleRemoveQr() {
    if (!confirm("Remove the current QR code image?")) return;
    setMessage(null);

    startRemoveTransition(async () => {
      const result = await removePaymentMethodQrAction(method.code);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "QR code removed." });
      }
    });
  }

  function handleSaveDetails(formData: FormData) {
    setMessage(null);
    startDetailsTransition(async () => {
      const result = await updatePaymentMethodAction(method.code, formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: "Payment method updated successfully!",
        });
        setIsEditing(false);
      }
    });
  }

  return (
    <div className="overflow-hidden border border-surface-dim bg-surface-lowest shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-dim bg-surface-container px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-label text-secondary">
            Payment Method
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-foreground">
            {method.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-label ${
              isActive
                ? "bg-green-50 text-green-700"
                : "bg-surface-high text-secondary"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
          <button
            type="button"
            onClick={handleToggleActive}
            disabled={isTogglingActive}
            aria-label={`${isActive ? "Deactivate" : "Activate"} ${method.name}`}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-label transition-colors disabled:opacity-50 ${isActive ? "border border-surface-dim bg-white text-foreground hover:bg-surface-low" : "bg-primary text-primary-foreground hover:opacity-80"}`}
          >
            {isTogglingActive ? "Saving..." : isActive ? "Deactivate" : "Activate"}
          </button>
          <span className="rounded-full bg-surface-lowest px-3 py-1 text-[10px] font-semibold uppercase tracking-label text-secondary">
            {method.code}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT — QR Code Section */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[11px] font-semibold uppercase tracking-label text-secondary">
              QR Code
            </h4>

            {/* Current QR or placeholder */}
            {!qrPreview && method.qr_image_url ? (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl border border-surface-dim bg-white p-4 shadow-sm">
                  <Image
                    src={method.qr_image_url}
                    alt={`${method.name} QR Code`}
                    width={192}
                    height={192}
                    unoptimized
                    className="h-48 w-48 object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-surface-container px-4 py-2 text-[10px] font-semibold uppercase tracking-label text-foreground transition-colors hover:bg-surface-high"
                  >
                    Change QR Code
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveQr}
                    disabled={isRemovingQr}
                    className="bg-error/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-label text-error transition-colors hover:bg-error/20 disabled:opacity-50"
                  >
                    {isRemovingQr ? "Removing..." : "Remove"}
                  </button>
                </div>
              </div>
            ) : !qrPreview ? (
              <div className="flex flex-col items-center gap-3">
                <label
                  htmlFor={`qr-${method.code}`}
                  className="group flex w-full cursor-pointer flex-col items-center justify-center border-2 border-dashed border-surface-dim bg-surface-low px-6 py-10 text-center transition-colors hover:border-foreground hover:bg-surface-container"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-xl text-foreground transition-transform group-hover:scale-105">
                    ↑
                  </div>
                  <p className="mt-4 text-sm font-semibold text-foreground">
                    Upload QR Code
                  </p>
                  <p className="mt-1 text-xs text-on-surface-variant">
                    PNG, JPG, WEBP — max 5 MB
                  </p>
                </label>
              </div>
            ) : null}

            {/* Preview of selected new QR */}
            {qrPreview && (
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-white p-4">
                  <Image
                    src={qrPreview}
                    alt="New QR preview"
                    width={192}
                    height={192}
                    unoptimized
                    className="h-48 w-48 object-contain"
                  />
                </div>
                <p className="text-xs text-on-surface-variant">
                  Preview — click Save to apply
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveQr}
                    disabled={isUploadingQr}
                    className="bg-primary px-5 py-2 text-[10px] font-semibold uppercase tracking-label-wide text-primary-foreground transition-colors hover:bg-surface-highest hover:text-foreground disabled:opacity-50"
                  >
                    {isUploadingQr ? "Uploading..." : "Save QR Code"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelQrUpload}
                    disabled={isUploadingQr}
                    className="bg-surface-container px-5 py-2 text-[10px] font-semibold uppercase tracking-label text-foreground transition-colors hover:bg-surface-high disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              id={`qr-${method.code}`}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* RIGHT — Account Details */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-label text-secondary">
                Account Details
              </h4>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-[10px] font-semibold uppercase tracking-label text-foreground underline underline-offset-4"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form action={handleSaveDetails} className="flex flex-col gap-3">
                <EditField
                  label="Name"
                  name="name"
                  defaultValue={method.name}
                  required
                />
                <EditField
                  label="Account Name"
                  name="account_name"
                  defaultValue={method.account_name ?? ""}
                />
                <EditField
                  label="Account Phone"
                  name="account_phone"
                  defaultValue={method.account_phone ?? ""}
                />
                <EditField
                  label="Account Number"
                  name="account_number"
                  defaultValue={method.account_number ?? ""}
                />
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-label text-secondary">
                    Instructions
                  </label>
                  <textarea
                    name="instructions"
                    rows={3}
                    defaultValue={method.instructions ?? ""}
                    className="mt-1 block w-full bg-surface-low px-3 py-2.5 text-sm text-foreground focus:bg-surface-container-low focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isSavingDetails}
                    className="bg-primary px-5 py-2 text-[10px] font-semibold uppercase tracking-label-wide text-primary-foreground transition-colors hover:bg-surface-highest hover:text-foreground disabled:opacity-50"
                  >
                    {isSavingDetails ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setMessage(null);
                    }}
                    disabled={isSavingDetails}
                    className="bg-surface-container px-5 py-2 text-[10px] font-semibold uppercase tracking-label text-foreground transition-colors hover:bg-surface-high disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Account Name"
                  value={method.account_name}
                />
                <InfoItem
                  label="Account Phone"
                  value={method.account_phone}
                />
                <InfoItem
                  label="Account Number"
                  value={method.account_number}
                />
                <InfoItem label="Sort Order" value={String(method.sort_order)} />
                {method.instructions && (
                  <div className="sm:col-span-2">
                    <InfoItem
                      label="Instructions"
                      value={method.instructions}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        {message?.type === "success" && (
          <AdminSuccessToast message={message.text} onDismiss={() => setMessage(null)} />
        )}
        {message?.type === "error" && (
          <div
            role="alert"
            className="mt-4 border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────────── Sub-components ────────────────── */

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="bg-surface-container px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-label text-secondary">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-foreground">
        {value ?? "—"}
      </p>
    </div>
  );
}

function EditField({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold uppercase tracking-label text-secondary">
        {label}
      </label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 block w-full bg-surface-low px-3 py-2.5 text-sm text-foreground focus:bg-surface-container-low focus:outline-none"
      />
    </div>
  );
}


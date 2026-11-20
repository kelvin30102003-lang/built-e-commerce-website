"use client";

import { useEffect, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { saveProfileAddressAction } from "@/lib/actions/profile-address";
import { YANGON_TOWNSHIPS } from "@/lib/shop/constants";

type ProfileValues = {
  id?: number;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  addressLine1: string;
  township: string;
};

const inputClass = "mt-2 block h-[58px] w-full rounded-full border border-neutral-200 bg-white px-5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-100";

function FieldLabel({ children, icon }: { children: ReactNode; icon: "name" | "email" | "phone" | "location" }) {
  const common = "h-4 w-4 shrink-0";
  return (
    <span className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-neutral-500">
      <svg aria-hidden="true" className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {icon === "name" ? <path d="m3 8 4 3 5-7 5 7 4-3-2 11H5L3 8Z M5 15h14" /> : null}
        {icon === "email" ? <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></> : null}
        {icon === "phone" ? <path d="M6.6 3.5h3l1.5 4-2 1.5a15 15 0 0 0 5.9 5.9l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" /> : null}
        {icon === "location" ? <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></> : null}
      </svg>
      {children}
    </span>
  );
}

export function ProfileAddressForm({ profile }: { profile: ProfileValues }) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (message?.type !== "success") return;
    const timeout = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await saveProfileAddressAction(formData);
      if (result.error) setMessage({ type: "error", text: result.error });
      else setMessage({ type: "success", text: result.success ?? "Profile details saved." });
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[30px] border border-neutral-200 bg-white px-6 py-8 shadow-[0_12px_35px_rgba(15,23,42,0.04)] sm:px-10 sm:py-10">
      {profile.id ? <input type="hidden" name="id" value={profile.id} /> : null}
      <div className="mb-8">
        <h1 className="text-[26px] font-medium tracking-tight text-slate-900">Profile details</h1>
        <p className="mt-1 text-base text-slate-500">Keep your delivery info up to date for faster checkout.</p>
      </div>

      <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
        <label className="block">
          <FieldLabel icon="name">Name</FieldLabel>
          <input name="fullName" required maxLength={120} defaultValue={profile.fullName} className={inputClass} autoComplete="name" />
        </label>
        <label className="block">
          <FieldLabel icon="email">Email</FieldLabel>
          <input name="email" type="email" required maxLength={254} defaultValue={profile.email} className={inputClass} autoComplete="email" />
        </label>
        <label className="block">
          <FieldLabel icon="phone">Phone</FieldLabel>
          <input name="phone" type="tel" required maxLength={40} defaultValue={profile.phone} className={inputClass} autoComplete="tel" />
        </label>
        <label className="block">
          <FieldLabel icon="location">Country</FieldLabel>
          <select name="country" required defaultValue={profile.country} className={`${inputClass} appearance-none`}>
            <option value="">Select country</option>
            <option value="Myanmar">Myanmar</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <FieldLabel icon="location">Address</FieldLabel>
          <input name="addressLine1" required maxLength={250} defaultValue={profile.addressLine1} className={inputClass} autoComplete="street-address" />
        </label>
        <label className="block">
          <FieldLabel icon="location">State / Region</FieldLabel>
          <select name="state" required defaultValue="Yangon" className={`${inputClass} appearance-none`}>
            <option value="Yangon">Yangon</option>
          </select>
        </label>
        <label className="block">
          <FieldLabel icon="location">Township</FieldLabel>
          <select name="township" required defaultValue={profile.township} className={`${inputClass} appearance-none`}>
            <option value="">{profile.country ? "Select township" : "Choose country first"}</option>
            {YANGON_TOWNSHIPS.map((township) => <option key={township} value={township}>{township}</option>)}
          </select>
        </label>
      </div>

      {message?.type === "error" ? (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message.text}</p>
      ) : null}
      {message?.type === "success" ? (
        <p role="status" aria-live="polite" className="fixed right-4 top-4 z-50 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-lg sm:right-6 sm:top-6">{message.text}</p>
      ) : null}

      <div className="mt-7">
        <button type="submit" disabled={isPending} className="min-w-[184px] rounded-full bg-black px-8 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 disabled:cursor-wait disabled:opacity-60">
          {isPending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState, useTransition } from "react";
import { registerAction } from "@/lib/actions/auth";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await registerAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-label text-secondary">Full name</label>
        <input
          type="text"
          name="fullName"
          required
          className="mt-1 block w-full bg-surface-low px-3 py-3 text-sm text-foreground focus:bg-surface-container-low focus:outline-none"
        />
      </div>
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-label text-secondary">Email</label>
        <input
          type="email"
          name="email"
          required
          className="mt-1 block w-full bg-surface-low px-3 py-3 text-sm text-foreground focus:bg-surface-container-low focus:outline-none"
        />
      </div>
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-label text-secondary">Password</label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="mt-1 block w-full bg-surface-low px-3 py-3 text-sm text-foreground focus:bg-surface-container-low focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-label-wide text-primary-foreground transition-colors hover:bg-surface-highest hover:text-foreground disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}

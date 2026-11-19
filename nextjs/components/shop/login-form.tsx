"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { loginAction } from "@/lib/actions/auth";

export function LoginForm({ redirect }: { redirect?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  }


  return (
    <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
      <input type="hidden" name="redirect" value={redirect ?? "/"} />
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
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold uppercase tracking-label text-secondary">Password</label>
          <Link href="/reset-password" className="text-[11px] text-primary underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          name="password"
          required
          className="mt-1 block w-full bg-surface-low px-3 py-3 text-sm text-foreground focus:bg-surface-container-low focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-label-wide text-primary-foreground transition-colors hover:bg-surface-highest hover:text-foreground disabled:opacity-50"
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

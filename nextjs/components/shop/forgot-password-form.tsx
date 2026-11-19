'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { resetPasswordAction } from '@/lib/actions/auth';

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(formData);
      if (result?.error) setError(result.error);
      else setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="mt-6 bg-surface-lowest px-4 py-4 text-sm text-foreground shadow-sm">
        ✅ Check your email — we sent a password reset link.
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-label text-secondary">Email</label>
        <input
          type="email"
          name="email"
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
        {isPending ? 'Sending...' : 'Send Reset Link'}
      </button>
      <p className="text-center text-sm text-secondary">
        Remember your password?{' '}
        <Link href="/login" className="text-primary underline underline-offset-4">Sign in</Link>
      </p>
    </form>
  );
}

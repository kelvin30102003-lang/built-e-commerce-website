'use client';

import { useState, useTransition } from 'react';
import { updatePasswordAction } from '@/lib/actions/auth';

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePasswordAction(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-label text-secondary">New Password</label>
        <input type="password" name="password" required minLength={6}
          className="mt-1 block w-full bg-surface-low px-3 py-3 text-sm text-foreground focus:bg-surface-container-low focus:outline-none" />
      </div>
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-label text-secondary">Confirm Password</label>
        <input type="password" name="confirm" required minLength={6}
          className="mt-1 block w-full bg-surface-low px-3 py-3 text-sm text-foreground focus:bg-surface-container-low focus:outline-none" />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <button type="submit" disabled={isPending}
        className="w-full bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-label-wide text-primary-foreground transition-colors hover:bg-surface-highest hover:text-foreground disabled:opacity-50">
        {isPending ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

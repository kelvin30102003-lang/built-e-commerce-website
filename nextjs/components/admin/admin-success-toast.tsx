"use client";

import { useEffect } from "react";

export function AdminSuccessToast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss?.(), 3000);
    return () => window.clearTimeout(timeout);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-lg shadow-slate-900/10 sm:right-6 sm:top-6"
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">
        ✓
      </span>
      {message}
    </div>
  );
}

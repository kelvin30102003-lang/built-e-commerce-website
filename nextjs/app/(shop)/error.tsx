'use client';
export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg font-semibold text-foreground">Something went wrong.</p>
      <p className="text-sm text-secondary">{error.message}</p>
      <button onClick={reset} className="bg-primary px-6 py-2 text-[11px] font-semibold uppercase tracking-label-wide text-primary-foreground hover:bg-surface-highest hover:text-foreground">
        Try again
      </button>
    </div>
  );
}

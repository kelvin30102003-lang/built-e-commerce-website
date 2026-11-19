import React from 'react';

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred.';
  return (
    <div className="rounded-md bg-error-100 p-4 text-error-800">
      <p className="mb-2 font-semibold">Error</p>
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Retry
        </button>
      )}
    </div>
  );
}

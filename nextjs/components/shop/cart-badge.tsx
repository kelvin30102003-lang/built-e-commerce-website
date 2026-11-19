export function CartBadge({ count }: { count: number }) {
  return (
    // Shopping BAG style — icon + count label side by side (like the reference UI)
    <span className="inline-flex items-center gap-1.5">
      {/* Shopping bag SVG (not cart/trolley) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden
      >
        {/* Bag body */}
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        {/* Bag handle */}
        <path d="M3 6h18" />
        {/* Handle arch */}
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {count > 0 && (
        <span className="flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
          {count}
        </span>
      )}
    </span>
  );
}

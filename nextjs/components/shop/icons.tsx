export function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function BookmarkIcon({
  className = "h-5 w-5",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.75h12a.75.75 0 0 1 .75.75v16.5l-6.75-4.5-6.75 4.5V4.5A.75.75 0 0 1 6 3.75Z" />
    </svg>
  );
}

export function HeartIcon({
  className = "h-5 w-5",
  filled = false,
}: {
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20.25s-7.5-4.55-9.75-9.15C.75 7.6 2.6 4.5 6 4.5c2.1 0 3.6 1.2 6 3.6 2.4-2.4 3.9-3.6 6-3.6 3.4 0 5.25 3.1 3.75 6.6-2.25 4.6-9.75 9.15-9.75 9.15Z"
      />
    </svg>
  );
}

export function BagIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.436M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.881-4.751 2.25-7.32.021-.15-.089-.3-.245-.3H5.106M7.5 14.25 5.106 5.972M7.5 14.25 5.106 5.972"
      />
    </svg>
  );
}

export function UserIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 20.25c0-3.45 3.35-6.25 7.5-6.25s7.5 2.8 7.5 6.25" />
    </svg>
  );
}

export function HomeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 9.75V19.5a.75.75 0 0 0 .75.75h4.5v-6h3v6h4.5a.75.75 0 0 0 .75-.75V9.75" />
    </svg>
  );
}

export function GridIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <rect x="3.75" y="3.75" width="6.5" height="6.5" rx="0.5" />
      <rect x="13.75" y="3.75" width="6.5" height="6.5" rx="0.5" />
      <rect x="3.75" y="13.75" width="6.5" height="6.5" rx="0.5" />
      <rect x="13.75" y="13.75" width="6.5" height="6.5" rx="0.5" />
    </svg>
  );
}

import Link from "next/link";

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold uppercase tracking-tight text-foreground">Track Your Order</h1>
      <p className="mt-3 text-secondary">
        Log in and visit your profile to see the status of all your orders.
      </p>
      <Link
        href="/profile"
        className="mt-6 inline-block bg-primary px-6 py-3 text-[11px] font-semibold uppercase tracking-label-wide text-primary-foreground transition-colors hover:bg-surface-highest hover:text-foreground"
      >
        Go to My Orders
      </Link>
    </div>
  );
}

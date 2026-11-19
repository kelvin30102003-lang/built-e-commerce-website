export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 animate-pulse">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square rounded-xl bg-surface-low" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 rounded bg-surface-low" />
          <div className="h-6 w-1/4 rounded bg-surface-low" />
          <div className="h-4 w-full rounded bg-surface-low" />
          <div className="h-4 w-5/6 rounded bg-surface-low" />
          <div className="h-12 w-1/2 rounded bg-surface-low" />
        </div>
      </div>
    </div>
  );
}

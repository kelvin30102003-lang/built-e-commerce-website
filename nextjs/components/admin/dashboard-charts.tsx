"use client";

import { formatMmk } from "@/lib/shop/format";

const STATUS_META: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#111827" },
  confirmed: { label: "Confirmed", color: "#4b5563" },
  processing: { label: "Processing", color: "#6b7280" },
  shipped: { label: "Shipped", color: "#9ca3af" },
  delivered: { label: "Delivered", color: "#000000" },
  cancelled: { label: "Cancelled", color: "#cbd5e1" },
  refunded: { label: "Refunded", color: "#e5e7eb" },
};

export function DashboardCharts({
  salesByDay,
  orderStatusCounts,
}: {
  salesByDay: { key: string; label: string; total: number }[];
  orderStatusCounts: { status: string; count: number }[];
}) {
  const totalOrders = orderStatusCounts.reduce((sum, item) => sum + item.count, 0);
  let accumulatedPercent = 0;
  const donutSegments = orderStatusCounts.map((item) => {
    const percent = totalOrders ? (item.count / totalOrders) * 100 : 0;
    const segment = { ...item, percent, offset: accumulatedPercent };
    accumulatedPercent += percent;
    return segment;
  });
  const maxSales = Math.max(...salesByDay.map((day) => day.total), 0);

  return (
    <section aria-label="Sales and order charts" className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)]">
      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(30,41,59,0.03)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">Sales over time</h2>
            <p className="mt-1 text-xs text-slate-400">Daily paid sales · last 7 days</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">7 days</span>
        </div>

        <div className="relative mt-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex h-44 flex-col justify-between">
            {[0, 1, 2, 3].map((line) => <span key={line} className="border-t border-dashed border-slate-100" />)}
          </div>
          <div className="relative grid h-44 grid-cols-7 items-end gap-2 sm:gap-4">
            {salesByDay.map((day) => {
              const barHeight = maxSales ? Math.max((day.total / maxSales) * 100, day.total ? 6 : 2) : 2;
              return (
                <div key={day.key} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      role="img"
                      aria-label={`${day.label}: ${formatMmk(day.total)} sales`}
                      title={`${day.label} · ${formatMmk(day.total)}`}
                      className={`w-full max-w-10 rounded-t-lg transition-all duration-500 ${day.total ? "bg-black hover:bg-slate-700" : "bg-slate-100"}`}
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 sm:text-xs">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        {maxSales === 0 && <p className="mt-4 text-center text-xs text-slate-400">No paid sales recorded in the last 7 days.</p>}
      </article>

      <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(30,41,59,0.03)] sm:p-6">
        <div>
          <h2 className="font-semibold text-slate-900">Orders by status</h2>
          <p className="mt-1 text-xs text-slate-400">Current order distribution</p>
        </div>

        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center xl:flex-col xl:gap-4">
          <div className="relative h-40 w-40 shrink-0">
            <svg role="img" aria-label={`Order status chart: ${totalOrders} total orders`} viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="44" fill="none" stroke="#f1f5f9" strokeWidth="13" />
              {donutSegments.filter((segment) => segment.percent > 0).map((segment) => (
                <circle
                  key={segment.status}
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  stroke={STATUS_META[segment.status]?.color ?? "#94a3b8"}
                  strokeWidth="13"
                  strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
                  strokeDashoffset={-segment.offset}
                  pathLength="100"
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold tracking-tight text-slate-900">{totalOrders}</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Orders</span>
            </div>
          </div>

          <ul className="grid w-full grid-cols-2 gap-x-4 gap-y-2 sm:max-w-52 sm:grid-cols-1 xl:max-w-none xl:grid-cols-2">
            {donutSegments.map((segment) => (
              <li key={segment.status} className="flex min-w-0 items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: STATUS_META[segment.status]?.color ?? "#94a3b8" }} />
                <span className="truncate text-slate-500">{STATUS_META[segment.status]?.label ?? segment.status}</span>
                <span className="ml-auto font-semibold text-slate-800">{segment.count}</span>
              </li>
            ))}
          </ul>
        </div>
        {totalOrders === 0 && <p className="mt-4 text-center text-xs text-slate-400">Order counts will appear here after your first sale.</p>}
      </article>
    </section>
  );
}

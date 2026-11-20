"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ADMIN_DATA_TABLES = [
  "orders",
  "order_items",
  "shipments",
  "payments",
  "payment_slips",
  "payment_methods",
  "products",
  "product_variants",
  "product_images",
  "categories",
  "brands",
  "product_colors",
  "coupons",
  "profiles",
  "contact_settings",
  "admin_activity_logs",
] as const;

type ConnectionState = "connecting" | "live" | "offline";

export function AdminRealtimeSync() {
  const router = useRouter();
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");

  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const refreshSoon = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 250);
    };

    const channel = supabase.channel("admin-panel-live-data");
    for (const table of ADMIN_DATA_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        refreshSoon,
      );
    }

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") setConnectionState("live");
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setConnectionState("offline");
      } else setConnectionState("connecting");
    });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshSoon();
    };
    window.addEventListener("focus", refreshSoon);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      window.removeEventListener("focus", refreshSoon);
      document.removeEventListener("visibilitychange", handleVisibility);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  const label = connectionState === "live" ? "Live updates" : connectionState === "offline" ? "Updates offline" : "Connecting";
  const indicator = connectionState === "live" ? "bg-emerald-500" : connectionState === "offline" ? "bg-rose-500" : "bg-amber-400";

  return (
    <span role="status" aria-live="polite" className="inline-flex items-center gap-2 rounded-full border border-surface-dim bg-surface-lowest px-3 py-1.5 text-xs font-medium text-secondary">
      <span className={`h-2 w-2 rounded-full ${indicator}`} aria-hidden="true" />
      {label}
    </span>
  );
}

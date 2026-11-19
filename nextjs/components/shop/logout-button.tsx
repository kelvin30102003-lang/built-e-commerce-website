"use client";

import { useTransition } from "react";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => logoutAction())}
      className="bg-surface-low px-4 py-2 text-[11px] font-semibold uppercase tracking-label text-foreground transition-colors hover:bg-surface-container disabled:opacity-50"
    >
      {isPending ? "Logging out..." : "Log out"}
    </button>
  );
}

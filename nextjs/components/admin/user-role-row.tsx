"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRoleAction } from "@/lib/actions/admin/users";
import type { AdminUserRow } from "@/lib/supabase/rpc";
import type { UserRole } from "@/lib/types/database";

const ROLES: UserRole[] = ["customer", "staff", "admin"];

const PERMISSION_FIELDS = [
  { key: "can_manage_products", label: "Products" },
  { key: "can_manage_orders", label: "Orders" },
  { key: "can_manage_users", label: "Users" },
  { key: "can_manage_coupons", label: "Coupons" },
  { key: "can_manage_reports", label: "Reports" },
] as const;

export function UserRoleRow({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        await updateUserRoleAction(formData);
        setEditing(false);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update role");
      }
    });
  }

  if (!editing) {
    return (
      <tr>
        <td className="px-4 py-2 text-primary">{user.full_name ?? "—"}</td>
        <td className="px-4 py-2 text-primary">{user.email}</td>
        <td className="px-4 py-2 capitalize text-primary">{user.role}</td>
        <td className="px-4 py-2 text-xs text-secondary">
          {PERMISSION_FIELDS.filter((f) => user[f.key]).map((f) => f.label).join(", ") || "—"}
        </td>
        <td className="px-4 py-2 text-right">
          <button onClick={() => setEditing(true)} className="text-primary hover:underline">
            Edit
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={5} className="p-3">
        <form action={handleSubmit} className="space-y-3 rounded-lg border border-surface-dim bg-surface p-4">
          <input type="hidden" name="userId" value={user.id} />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-primary">{user.full_name ?? user.email}</span>
            <select
              name="role"
              defaultValue={user.role}
              disabled={isSelf}
              className="rounded border border-surface-dim bg-white px-2 py-1 text-sm"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {isSelf && <span className="text-xs text-secondary">You cannot change your own role</span>}
          </div>

          <div className="flex flex-wrap gap-4">
            {PERMISSION_FIELDS.map((f) => (
              <label key={f.key} className="flex items-center gap-1.5 text-sm text-primary">
                <input type="checkbox" name={f.key} defaultChecked={user[f.key]} />
                {f.label}
              </label>
            ))}
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-full border border-surface-dim px-4 py-1.5 text-sm font-medium text-primary"
            >
              Cancel
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

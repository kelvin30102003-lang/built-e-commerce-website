import { requireAdminCapability } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatDateTime } from "@/lib/shop/format";

export default async function AdminActivityLogsPage() {
  await requireAdminCapability("reports");

  const supabase = await createClient();
  const { data: logs, error } = await supabase
    .from("admin_activity_logs")
    .select("id, action, details, created_at, profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-primary">Activity Log</h1>

      {!logs || logs.length === 0 ? (
        <EmptyState message="No admin activity recorded yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-dim bg-surface-lowest">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-surface-container text-left text-on-surface-variant">
              <tr>
                <th className="px-4 py-2">Admin</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">Details</th>
                <th className="px-4 py-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-2 text-primary">
                    {(log.profiles as { full_name: string | null } | null)?.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-primary">{log.action}</td>
                  <td className="px-4 py-2 text-xs text-secondary">
                    {log.details ? JSON.stringify(log.details) : "—"}
                  </td>
                  <td className="px-4 py-2 text-secondary">{formatDateTime(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

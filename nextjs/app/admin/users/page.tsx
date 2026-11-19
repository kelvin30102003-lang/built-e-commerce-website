import { requireAdmin } from "@/lib/auth/require-admin";
import { list_users_with_email } from "@/lib/supabase/rpc";
import { ErrorMessage } from "@/components/admin/ErrorMessage";
import { EmptyState } from "@/components/admin/EmptyState";
import { UserRoleRow } from "@/components/admin/user-role-row";

export default async function AdminUsersPage() {
  const { user: currentUser } = await requireAdmin();

  let users;
  try {
    users = await list_users_with_email();
  } catch (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-primary">User Management</h1>

      {users.length === 0 ? (
        <EmptyState message="No users found." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-surface-dim bg-surface-lowest">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-surface-container text-left text-on-surface-variant">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Permissions</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-dim">
              {users.map((u) => (
                <UserRoleRow key={u.id} user={u} isSelf={u.id === currentUser.id} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

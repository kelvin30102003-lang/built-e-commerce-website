import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types/database";

/**
 * Logs an admin action to `admin_activity_logs` via the security-definer RPC.
 * Errors are swallowed (logging must never break the calling action).
 */
export async function log_admin_activity(
  action: string,
  details?: Record<string, unknown> | null,
) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("log_admin_activity", {
    p_action: action,
    p_details: details ?? null,
  });
  if (error) {
    console.error("log_admin_activity failed:", error);
  }
}

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  can_manage_products: boolean;
  can_manage_orders: boolean;
  can_manage_users: boolean;
  can_manage_coupons: boolean;
  can_manage_reports: boolean;
  created_at: string;
}

/** Lists all users with their email (admin-only; email lives on auth.users). */
export async function list_users_with_email(): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_users_with_email");
  if (error) throw error;
  return data ?? [];
}

export interface UpdateUserRoleInput {
  userId: string;
  role: UserRole;
  canManageProducts?: boolean;
  canManageOrders?: boolean;
  canManageUsers?: boolean;
  canManageCoupons?: boolean;
  canManageReports?: boolean;
}

/** Updates a user's role and permission flags via the security-definer RPC. */
export async function update_user_role(input: UpdateUserRoleInput) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_user_role", {
    p_user_id: input.userId,
    p_role: input.role,
    p_can_manage_products: input.canManageProducts ?? false,
    p_can_manage_orders: input.canManageOrders ?? false,
    p_can_manage_users: input.canManageUsers ?? false,
    p_can_manage_coupons: input.canManageCoupons ?? false,
    p_can_manage_reports: input.canManageReports ?? false,
  });
  if (error) throw error;
}

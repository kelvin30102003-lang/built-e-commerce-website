import { getCurrentProfile } from '@/lib/auth/get-current-profile';
import { redirect } from 'next/navigation';

/**
 * Ensures that the current session belongs to an admin user.
 * If the user is not logged in or does not have the `admin` role,
 * they are redirected to the login page.
 */
export async function requireAdmin() {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile || profile.role !== 'admin') {
    redirect('/login');
  }

  return { user, profile };
}

/**
 * Ensures that the current session belongs to a staff or admin user.
 * Matches the `is_staff_or_admin()` RLS check used by most admin-facing
 * tables/policies, so this should guard the admin area generally — use
 * `requireAdmin` only for admin-only actions like user role management.
 */
export async function requireStaffOrAdmin() {
  const { user, profile } = await getCurrentProfile();

  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    redirect('/login');
  }

  return { user, profile };
}

export type AdminCapability = "products" | "orders" | "users" | "coupons" | "reports";

export async function requireAdminCapability(capability: AdminCapability) {
  const { user, profile } = await getCurrentProfile();
  const permission = {
    products: profile?.can_manage_products,
    orders: profile?.can_manage_orders,
    users: profile?.can_manage_users,
    coupons: profile?.can_manage_coupons,
    reports: profile?.can_manage_reports,
  }[capability];

  if (!user || !profile || (profile.role !== "admin" && !(profile.role === "staff" && permission))) {
    redirect("/");
  }
  return { user, profile };
}

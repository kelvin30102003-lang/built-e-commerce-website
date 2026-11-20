import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminRealtimeSync } from '@/components/admin/admin-realtime-sync';
import { LogoutButton } from '@/components/shop/logout-button';
import { requireStaffOrAdmin } from '@/lib/auth/require-admin';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Protect the entire admin area (staff and admin both have panel access;
  // admin-only actions like user role management guard themselves separately)
  const { profile } = await requireStaffOrAdmin();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        role={profile.role}
        permissions={{
          products: profile.can_manage_products,
          orders: profile.can_manage_orders,
          users: profile.can_manage_users,
          coupons: profile.can_manage_coupons,
          reports: profile.can_manage_reports,
        }}
      />
      <div className="flex-1">
        <header className="flex items-center justify-end gap-4 border-b border-surface-dim bg-surface px-6 py-3">
          <AdminRealtimeSync />
          <LogoutButton />
        </header>
        <main className="p-6 bg-surface-lowest">{children}</main>
      </div>
    </div>
  );
}

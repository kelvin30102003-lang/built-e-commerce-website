"use server";

import { revalidatePath } from "next/cache";
import { update_user_role } from "@/lib/supabase/rpc";
import type { UserRole } from "@/lib/types/database";

const VALID_ROLES: UserRole[] = ["customer", "staff", "admin"];

export async function updateUserRoleAction(formData: FormData) {
  const userId = formData.get("userId") as string;
  const role = formData.get("role") as string;

  if (!userId || !VALID_ROLES.includes(role as UserRole)) {
    throw new Error("Invalid user or role");
  }

  await update_user_role({
    userId,
    role: role as UserRole,
    canManageProducts: formData.get("can_manage_products") === "on",
    canManageOrders: formData.get("can_manage_orders") === "on",
    canManageUsers: formData.get("can_manage_users") === "on",
    canManageCoupons: formData.get("can_manage_coupons") === "on",
    canManageReports: formData.get("can_manage_reports") === "on",
  });

  revalidatePath("/admin/users");
}

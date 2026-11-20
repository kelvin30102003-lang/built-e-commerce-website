"use server";

import { revalidatePath } from "next/cache";
import { update_user_role } from "@/lib/supabase/rpc";
import type { UserRole } from "@/lib/types/database";
import { z } from "zod";

export async function updateUserRoleAction(formData: FormData) {
  const parsed = z.object({ userId: z.string().uuid(), role: z.enum(["customer", "staff", "admin"]) }).safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    throw new Error("Invalid user or role");
  }

  await update_user_role({
    userId: parsed.data.userId,
    role: parsed.data.role as UserRole,
    canManageProducts: formData.get("can_manage_products") === "on",
    canManageOrders: formData.get("can_manage_orders") === "on",
    canManageUsers: formData.get("can_manage_users") === "on",
    canManageCoupons: formData.get("can_manage_coupons") === "on",
    canManageReports: formData.get("can_manage_reports") === "on",
  });

  revalidatePath("/admin/users");
}

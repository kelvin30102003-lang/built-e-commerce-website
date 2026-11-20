"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSuccessToast } from "@/components/admin/admin-success-toast";

export function ContactSavedToast() {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  if (!visible) return null;

  return (
    <AdminSuccessToast
      message="Contact details saved."
      onDismiss={() => {
        setVisible(false);
        router.replace("/admin/contact", { scroll: false });
      }}
    />
  );
}

import { redirect } from "next/navigation";

// Register page now redirects to the combined login page with the "register" tab open
export default function RegisterPage() {
  redirect("/login?tab=register");
}

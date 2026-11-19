import { redirect } from "next/navigation";

// The /auth route redirects to the combined login page
export default function AuthPage() {
  redirect("/login");
}

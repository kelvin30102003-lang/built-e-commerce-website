"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { consumeActionRateLimit } from "@/lib/security/rate-limit";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  if (!(await consumeActionRateLimit("login", parsed.data.email, 8, 900))) return { error: "Too many attempts. Please try again later." };
  if (!(await consumeActionRateLimit("login-ip", "all", 40, 3600))) return { error: "Too many attempts. Please try again later." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email or password is incorrect." };

  const redirectTo = safeRedirect(formData.get("redirect"));
  redirect(redirectTo);
}

const registerSchema = credentialsSchema.extend({
  password: z.string().min(8),
  fullName: z.string().trim().min(1).max(120),
});

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success) return { error: "Please fill in all fields correctly." };
  if (!(await consumeActionRateLimit("signup", parsed.data.email, 5, 3600))) return { error: "Too many attempts. Please try again later." };
  if (!(await consumeActionRateLimit("signup-ip", "all", 20, 3600))) return { error: "Too many attempts. Please try again later." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) {
    console.error("Supabase signup rejected", { code: error.code, status: error.status });
    return { error: "Unable to create account. Check your details or try later." };
  }

  const redirectTo = safeRedirect(formData.get("redirect"));
  redirect(`/login?registered=1&redirect=${encodeURIComponent(redirectTo)}`);
}

function safeRedirect(value: FormDataEntryValue | null) {
  const path = typeof value === "string" ? value : "/";
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : "/";
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = z.string().email().safeParse(formData.get('email'));
  if (!parsed.success) return { error: 'Enter a valid email address.' };
  if (!(await consumeActionRateLimit("password-reset", parsed.data, 3, 3600))) return { error: 'Too many requests. Please try again later.' };
  if (!(await consumeActionRateLimit("password-reset-ip", "all", 10, 3600))) return { error: 'Too many requests. Please try again later.' };
  const supabase = await createClient();
  const requestHeaders = await headers();
  const candidate = process.env.NEXT_PUBLIC_SITE_URL ?? requestHeaders.get("origin");
  let siteUrl: string;
  try {
    const parsedUrl = new URL(candidate ?? "");
    if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("Invalid protocol");
    siteUrl = parsedUrl.origin;
  } catch {
    return { error: 'Password reset is temporarily unavailable.' };
  }
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password/update`,
  });
  if (error) return { error: error.message };
  return { success: true };
}

export async function updatePasswordAction(formData: FormData) {
  const parsed = z.object({ password: z.string().min(8).max(128), confirm: z.string() }).safeParse({
    password: formData.get('password'), confirm: formData.get('confirm'),
  });
  if (!parsed.success) return { error: 'Password must be between 8 and 128 characters.' };
  if (parsed.data.password !== parsed.data.confirm) return { error: 'Passwords do not match.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  redirect('/login');
}

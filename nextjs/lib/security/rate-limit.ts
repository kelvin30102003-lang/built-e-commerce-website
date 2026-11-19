import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export async function consumeActionRateLimit(
  action: string,
  subject: string,
  maxRequests: number,
  windowSeconds: number,
) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-real-ip") ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const digest = createHash("sha256").update(`${action}:${ip}:${subject.toLowerCase()}`).digest("hex");
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("consume_action_rate_limit", {
      p_key: digest,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("Rate limit check failed", error.message);
      return false;
    }
    return data === true;
  } catch (error) {
    console.error("Rate limit service is unavailable", error);
    return false;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { consumeActionRateLimit } from "@/lib/security/rate-limit";

const ALLOWED_DESTINATIONS = new Set(["/cart", "/checkout"]);

export async function GET(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  const requestHost = request.nextUrl.host;
  let originHost: string | null = null;
  try {
    originHost = origin ? new URL(origin).host : null;
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (fetchSite === "cross-site" || (originHost && originHost !== requestHost)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const requestedDestination = request.nextUrl.searchParams.get("redirect");
  const destination = requestedDestination && ALLOWED_DESTINATIONS.has(requestedDestination)
    ? requestedDestination
    : "/cart";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    if (!(await consumeActionRateLimit("guest-session", "all", 60, 3600))) {
      return NextResponse.json({ error: "Guest checkout is temporarily unavailable. Try again later." }, { status: 429 });
    }
    const { error } = await supabase.auth.signInAnonymously();
    if (error) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", destination);
      loginUrl.searchParams.set("guest", "unavailable");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.redirect(new URL(destination, request.url));
}

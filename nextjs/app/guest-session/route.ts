import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_DESTINATIONS = new Set(["/cart", "/checkout"]);

export async function GET(request: NextRequest) {
  const requestedDestination = request.nextUrl.searchParams.get("redirect");
  const destination = requestedDestination && ALLOWED_DESTINATIONS.has(requestedDestination)
    ? requestedDestination
    : "/cart";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
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

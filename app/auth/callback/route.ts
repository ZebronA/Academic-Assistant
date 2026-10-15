import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/", requestUrl.origin));
  }

  // Keep the PKCE exchange in the browser so Supabase can persist the
  // resulting session in the same storage used by the client-side app.
  const destination = new URL("/", requestUrl.origin);
  destination.searchParams.set("code", code);
  return NextResponse.redirect(destination);
}

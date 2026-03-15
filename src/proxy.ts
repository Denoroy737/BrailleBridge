import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest): NextResponse {
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options",        "SAMEORIGIN");
  res.headers.set("Referrer-Policy",        "strict-origin-when-cross-origin");

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = process.env["NEXT_PUBLIC_APP_URL"] ?? "*";
    res.headers.set("Access-Control-Allow-Origin",  origin);
    res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

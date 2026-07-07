import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: req.nextUrl.protocol === "https:",
  });

  // Admin API routes: respond with JSON instead of redirecting
  if (pathname.startsWith("/api/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Admin pages: require an authenticated admin
  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname + search);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // Account pages: require any authenticated user
  if (pathname.startsWith("/account") && !token) {
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/api/admin/:path*"],
};

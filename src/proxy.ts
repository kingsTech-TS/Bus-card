import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/cards",
  "/templates",
  "/brand-kit",
  "/assets",
  "/profile",
  "/analytics",
  "/admin",
];

const authRoutes = ["/login", "/signup", "/forgot-password", "/reset-password"];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // We rely on the client-side `auth_token` cookie because Next.js middleware 
  // cannot read localStorage. The exact validity is handled by the backend.
  const hasToken = req.cookies.has("auth_token") || req.cookies.has("refresh_token");

  // Protect internal routes
  const isProtected = protectedRoutes.some((route) => path.startsWith(route));
  if (isProtected && !hasToken) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Prevent logged-in users from seeing login/signup pages
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));
  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

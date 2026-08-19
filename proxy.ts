import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value || "";
  const { pathname } = req.nextUrl;

  // console.log(Boolean(token));

  if (!token) {
    // If the token is invalid and user already on the sign-in page,
    // redirect to /sign-in
    if (pathname.startsWith("/dashboard")) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // If token is valid and trying to access sign-in, redirect to dashboard
    if (pathname === "/login") {
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = "/dashboard/reserve";
      dashboardUrl.search = "";
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", // Protect dashboard route and sub-routes
    "/login/:path*", //protect login route and sub-routes
    // Add more routes to protect
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { CURRENT_PAGE_HEADER, getLoginUrl, getSafeRedirectTo } from "@/lib/api/session";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value;
  const { pathname } = req.nextUrl;

  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(
      getLoginUrl("expired", pathname + req.nextUrl.search),
      req.url,
    ));
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL(
      getSafeRedirectTo(req.nextUrl.searchParams.get("redirectTo")) ?? "/dashboard/reserve",
      req.url,
    ));
  }

  // Overwrite any client-supplied value before forwarding to Server Components.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(CURRENT_PAGE_HEADER, pathname + req.nextUrl.search);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/dashboard/:path*", "/login/:path*"],
};

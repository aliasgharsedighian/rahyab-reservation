import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLoginUrl } from "@/lib/api/session";

export function GET(request: NextRequest) {
  const reason = request.nextUrl.searchParams.get("session") === "disabled"
    ? "disabled" : "expired";
  // Keep Location relative for deployments behind a reverse proxy.
  const response = new NextResponse(null, {
    status: 307,
    headers: {
      Location: getLoginUrl(reason, request.nextUrl.searchParams.get("redirectTo")),
      "Cache-Control": "no-store",
    },
  });
  response.cookies.delete("user_token");
  return response;
}

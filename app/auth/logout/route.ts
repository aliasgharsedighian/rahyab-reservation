import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("session", "expired");

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("user_token");

  return response;
}

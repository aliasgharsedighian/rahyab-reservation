import { NextResponse } from "next/server";

export function GET() {
  // Keep this location relative so deployments behind a reverse proxy do not
  // leak the internal Next.js origin (for example localhost:3003).
  const response = new NextResponse(null, {
    status: 307,
    headers: {
      Location: "/login?session=expired",
    },
  });
  response.cookies.delete("user_token");

  return response;
}

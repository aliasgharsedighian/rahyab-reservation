import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiUrl } from "./url";

/** Authenticated fetch for Server Components and server-only modules. */
export async function serverApiFetch(
  path: string | URL,
  init: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;

  if (!token) {
    redirect("/auth/logout");
  }

  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(getApiUrl(path), { ...init, headers });

  if (response.status === 401) {
    // Cookie mutation is unsupported during Server Component rendering. The
    // Route Handler expires it before taking the browser to the login page.
    redirect("/auth/logout");
  }

  return response;
}

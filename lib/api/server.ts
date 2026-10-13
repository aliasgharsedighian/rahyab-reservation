import "server-only";

import { cookies, headers as requestHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getApiUrl } from "./url";
import { CURRENT_PAGE_HEADER, getLogoutUrl, getSessionFailure } from "./session";

/** Authenticated fetch for Server Components and server-only modules. */
export async function serverApiFetch(
  path: string | URL,
  init: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;
  const currentPage = (await requestHeaders()).get(CURRENT_PAGE_HEADER);

  if (!token) redirect(getLogoutUrl("expired", currentPage));

  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(getApiUrl(path), { ...init, headers });
  // Read a clone so callers can still consume the original body normally.
  const body: unknown = await response.clone().json().catch(() => null);
  const failure = getSessionFailure(response.status, body);
  if (failure) {
    // Cookie mutation is unsupported during Server Component rendering. The
    // Route Handler expires it before taking the browser to the login page.
    redirect(getLogoutUrl(failure, currentPage));
  }

  return response;
}

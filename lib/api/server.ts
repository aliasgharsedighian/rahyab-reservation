import "server-only";

import { cookies, headers as requestHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { collectErrorOccurrence, getApiErrorContext, getFetchErrorCode, getTechnicalErrorCode, type ErrorEventContext, type ErrorOccurrence } from "../analytics-errors";
import { getApiUrl } from "./url";
import { CURRENT_PAGE_HEADER, getLogoutUrl, getSessionFailure } from "./session";

/** Authenticated fetch for Server Components and server-only modules. */
export async function serverApiFetch(
  path: string | URL,
  init: RequestInit = {},
  errorEvents?: ErrorOccurrence[],
  errorContext: ErrorEventContext = getApiErrorContext(String(path), init.method?.toLowerCase()),
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;
  const currentPage = (await requestHeaders()).get(CURRENT_PAGE_HEADER);

  if (!token) redirect(getLogoutUrl("expired", currentPage));

  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  headers.set("Authorization", `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(getApiUrl(path), { ...init, headers });
  } catch (error) {
    if (!errorEvents || (init.signal?.aborted && init.signal.reason?.name !== "TimeoutError")) throw error;

    collectErrorOccurrence(errorEvents, errorContext, getFetchErrorCode(error));
    // Match the existing non-OK response path for pages that render the failure event.
    return Response.json({}, { status: 503 });
  }
  // Read a clone so callers can still consume the original body normally.
  const body: unknown = await response.clone().json().catch(() => undefined);
  const failure = getSessionFailure(response.status, body);
  if (failure) {
    // Cookie mutation is unsupported during Server Component rendering. The
    // Route Handler expires it before taking the browser to the login page.
    redirect(getLogoutUrl(failure, currentPage));
  }

  const errorCode = getTechnicalErrorCode(response.status, body)
    ?? (response.ok && response.status !== 204 && body === undefined ? "invalid_response" : undefined);
  if (errorEvents && errorCode) {
    collectErrorOccurrence(errorEvents, errorContext, errorCode);
    if (response.ok) return Response.json({}, { status: 503 });
  }

  return response;
}

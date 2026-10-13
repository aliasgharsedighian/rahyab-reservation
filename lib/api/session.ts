export type SessionFailure = "expired" | "disabled";

export const CURRENT_PAGE_HEADER = "x-rahyab-current-page";

/** Shared by Axios and server fetch, including APIs using HTTP 200 envelopes. */
export function getSessionFailure(httpStatus: number, data: unknown): SessionFailure | null {
  const body = data && typeof data === "object"
    ? data as { success?: unknown; status?: unknown; message?: unknown }
    : null;

  if (
    body?.success === false &&
    (httpStatus === 403 || body.status === 403) &&
    body.message === "حساب کاربری شما غیرفعال است."
  ) return "disabled";

  if (httpStatus === 401 || body?.status === 401) return "expired";
  return null;
}

/** Only allow internal dashboard destinations; never login/logout or external URLs. */
export function getSafeRedirectTo(value: string | null | undefined): string | null {
  if (!value?.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) {
    return null;
  }

  try {
    const url = new URL(value, "https://rahyab.invalid");
    if (
      url.origin !== "https://rahyab.invalid" ||
      !(url.pathname === "/dashboard" || url.pathname.startsWith("/dashboard/"))
    ) return null;

    // Next.js app-router transport parameter is not part of the user's page URL.
    url.searchParams.delete("_rsc");
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getLogoutUrl(reason: SessionFailure, currentPage?: string | null) {
  const params = new URLSearchParams({ session: reason });
  const redirectTo = reason === "expired" ? getSafeRedirectTo(currentPage) : null;
  if (redirectTo) params.set("redirectTo", redirectTo);
  return `/auth/logout?${params.toString()}`;
}

export function getLoginUrl(reason: SessionFailure, destination?: string | null) {
  const params = new URLSearchParams({ session: reason });
  const redirectTo = reason === "expired" ? getSafeRedirectTo(destination) : null;
  if (redirectTo) params.set("redirectTo", redirectTo);
  return `/login?${params.toString()}`;
}

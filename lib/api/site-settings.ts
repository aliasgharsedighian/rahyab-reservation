import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { collectErrorOccurrence, getApiErrorContext, getFetchErrorCode, getTechnicalErrorCode, type ErrorOccurrence } from "../analytics-errors";
import { getApiUrl } from "./url";

export type SiteSetting = {
  key: string;
  value: unknown;
  [field: string]: unknown;
};

function isSiteSetting(value: unknown): value is SiteSetting {
  return (
    typeof value === "object" &&
    value !== null &&
    "key" in value &&
    typeof value.key === "string" &&
    "value" in value
  );
}

export const loadSiteSettings = cache(async () => {
  await connection();
  const events: ErrorOccurrence[] = [];
  const context = getApiErrorContext("site-settings");

  try {
    const response = await fetch(getApiUrl("site-settings"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    const body = await response.json().catch(() => null);
    const errorCode = getTechnicalErrorCode(response.status, body);
    if (errorCode) collectErrorOccurrence(events, context, errorCode);
    if (!response.ok || errorCode) return { settings: [], events };
    const settings: unknown = Array.isArray(body) ? body : body?.data;
    // console.log(Array.isArray(settings) ? settings.filter(isSiteSetting) : []);
    if (!Array.isArray(settings)) collectErrorOccurrence(events, context, "invalid_response");
    return { settings: Array.isArray(settings) ? settings.filter(isSiteSetting) : [], events };
  } catch (error) {
    console.error("Could not load site settings", error);
    collectErrorOccurrence(events, context, getFetchErrorCode(error));
    return { settings: [], events };
  }
});

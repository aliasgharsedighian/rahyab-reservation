import "server-only";

import { cache } from "react";
import { connection } from "next/server";
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

export const getSiteSettings = cache(async (): Promise<SiteSetting[]> => {
  await connection();

  try {
    const response = await fetch(getApiUrl("site-settings"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return [];

    const body = await response.json();
    const settings: unknown = Array.isArray(body) ? body : body?.data;
    // console.log(Array.isArray(settings) ? settings.filter(isSiteSetting) : []);
    return Array.isArray(settings) ? settings.filter(isSiteSetting) : [];
  } catch (error) {
    console.error("Could not load site settings", error);
    return [];
  }
});

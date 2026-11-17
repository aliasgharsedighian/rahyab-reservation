import "server-only";

import { createHmac } from "node:crypto";

export function getAnalyticsUserId(user: unknown): string | null {
  const secret = process.env.FOODNIX_ANALYTICS_IDENTITY_KEY;
  if (!secret || !user || typeof user !== "object" || !("id" in user)) return null;

  const id = user.id;
  if (!(typeof id === "number" && Number.isSafeInteger(id) && id > 0)
    && !(typeof id === "string" && /^[1-9]\d*$/.test(id))) return null;

  try {
    return `usr_${createHmac("sha256", secret).update(`foodnix:user:v1:${id}`).digest("hex").slice(0, 32)}`;
  } catch {
    return null;
  }
}

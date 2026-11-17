import { logAnalyticsError } from "./analytics";
import type { ErrorEventContext } from "./analytics-errors";

export function getPaymentGatewayUrl(value: string | undefined, context: ErrorEventContext) {
  try {
    const url = new URL(value ?? "");
    if (url.protocol === "https:") return url.href;
  } catch {
    // An unusable URL prevents the user from starting the payment.
  }

  logAnalyticsError(context, "invalid_payment_url");
  throw new Error("Invalid payment URL");
}

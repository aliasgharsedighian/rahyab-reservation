export type ErrorEventName = "order_error" | "payment_error" | "menu_load_failed" | "api_error";

export interface ErrorEventContext {
  eventName: ErrorEventName;
  operation: string;
  orderId?: number;
}

export type ErrorCode =
  | `http_${number}`
  | "network_error"
  | "request_timeout"
  | "invalid_response"
  | "invalid_payment_url"
  | "gateway_unavailable";

export interface ErrorOccurrence extends ErrorEventContext {
  eventId: string;
  eventTime: string;
  errorCode?: ErrorCode;
}

export function createAnalyticsId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  // randomUUID requires a secure context, but getRandomValues also works over HTTP.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createErrorOccurrence(context: ErrorEventContext, errorCode?: ErrorCode): ErrorOccurrence {
  return {
    ...context,
    eventId: createAnalyticsId(),
    eventTime: new Date().toISOString(),
    errorCode,
  };
}

export function collectErrorOccurrence(events: ErrorOccurrence[], context: ErrorEventContext, code: ErrorCode) {
  try {
    events.push(createErrorOccurrence(context, code));
  } catch {
    console.warn("Analytics could not create an error event.");
  }
}

function technicalStatus(status: unknown): status is number {
  return typeof status === "number" && Number.isInteger(status)
    && (status === 408 || status === 429 || (status >= 500 && status < 600));
}

export function getTechnicalErrorCode(status: number, data: unknown): ErrorCode | undefined {
  if (technicalStatus(status)) return status === 408 ? "request_timeout" : `http_${status}`;
  if (!data || typeof data !== "object") return;

  const body = data as { status?: unknown; code?: unknown; error_code?: unknown };
  if (technicalStatus(body.status)) {
    return body.status === 408 ? "request_timeout" : `http_${body.status}`;
  }

  // The same HTTP status may represent a gateway outage or a business rejection.
  const code = body.error_code ?? body.code;
  if (code === "gateway_unavailable" || code === "request_timeout") return code;
}

const apiOperations: Record<string, string> = {
  "auth/logout": "logout",
  logout: "logout",
  notifications: "load_notifications",
  "notifications/mark-seen": "mark_notification_seen",
  "food-preferences": "load_food_preferences",
  "profile/change-password": "change_password",
  "profile/food-preferences": "update_food_preferences",
  "reservation-feedbacks": "submit_feedback",
  "reservation-feedbacks/by-food": "load_food_feedback",
  "reservations/history": "load_reservation_history",
  "reservations/upcoming": "load_upcoming_reservations",
  wallet: "load_wallet",
  "site-settings": "load_site_settings",
};

export function getFetchErrorCode(error: unknown): ErrorCode {
  return error instanceof Error && error.name === "TimeoutError" ? "request_timeout" : "network_error";
}

export function getApiErrorContext(path: string, method = "get"): ErrorEventContext {
  const endpoint = path.split(/[?#]/, 1)[0];
  const operation = endpoint === "profile"
    ? (method === "get" ? "load_profile" : "update_profile")
    : Object.prototype.hasOwnProperty.call(apiOperations, endpoint) ? apiOperations[endpoint] : "api_request";

  return { eventName: "api_error", operation };
}

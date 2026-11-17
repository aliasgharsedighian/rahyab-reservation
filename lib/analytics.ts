import {
  createAnalyticsId,
  createErrorOccurrence,
  type ErrorCode,
  type ErrorEventContext,
  type ErrorEventName,
  type ErrorOccurrence,
} from "./analytics-errors";
import { initializeBaasCore, type BaasCore } from "./baas-core";

type ProductView = {
  product_id: string;
  category: "food";
  in_stock: true;
  price: number;
};

const appVersion = "1.0.0";

type ErrorParameters = {
  event_id: string;
  event_name: ErrorEventName;
  event_time: string;
  session_id?: string;
  source: "frontend";
  platform: "web";
  app_version: string;
  operation: string;
  error_code?: ErrorCode;
  order_id?: number;
};

type AuthEventName = "login_started" | "login_completed" | "login_failed" | "session_started" | "session_ended" | "profile_viewed";
type AuthProperties = {
  user_id?: string;
  session_id?: string;
  correlation_id?: string;
  login_method?: "otp" | "password";
  reason?: "logout" | "expired" | "disabled";
};
type AuthParameters = AuthProperties & {
  event_id: string;
  event_name: AuthEventName;
  event_time: string;
  source: "frontend";
  platform: "web";
  app_version: string;
};

type PendingEvent = [name: "product_view", parameters: ProductView]
  | [name: ErrorEventName, parameters: ErrorParameters]
  | [name: AuthEventName, parameters: AuthParameters];

interface AnalyticsClient {
  logEvent(...event: PendingEvent): Promise<unknown>;
  flush(): Promise<unknown>;
  setAutomaticCollection(enabled: boolean): void;
}

declare global {
  interface Window {
    AnalyticsSDK?: new (core: BaasCore, config: { appVersion: string }) => AnalyticsClient;
  }
}

let analytics: AnalyticsClient | undefined;
let unavailable = false;
const pendingEvents: PendingEvent[] = [];
const reportedErrorIds = new Set<string>();
let sessionId: string | undefined;
const immediateEvents = new Set<PendingEvent[0]>([
  "login_started", "login_completed", "login_failed", "session_started", "session_ended",
  "order_error", "payment_error", "menu_load_failed", "api_error",
]);
let flushRequested = false;
let flushing = false;

async function flushImportantEvents() {
  flushRequested = true;
  if (flushing) return;
  flushing = true;
  try {
    // Events queued during an upload need another flush after that upload finishes.
    while (flushRequested && !unavailable) {
      flushRequested = false;
      try {
        await analytics?.flush();
      } catch {
        console.warn("Analytics queue could not be flushed.");
      }
    }
  } finally {
    flushing = false;
  }
}

function getSessionId() {
  if (sessionId) return sessionId;

  sessionId = `ses_${createAnalyticsId()}`;
  try {
    const storage = window.sessionStorage;
    const stored = storage.getItem("foodnix.analytics.session");
    if (stored && /^ses_[0-9a-f-]{36}$/i.test(stored)) sessionId = stored;
    storage.setItem("foodnix.analytics.session", sessionId);
  } catch {
    // Storage can be unavailable in a browser session.
  }

  return sessionId;
}

export function disableAnalytics() {
  unavailable = true;
  pendingEvents.length = 0;
}

async function sendEvent(event: PendingEvent) {
  if (event[0] !== "product_view") await Promise.resolve();
  try {
    if (unavailable || !analytics) return;
    await analytics.logEvent(...event);
    if (immediateEvents.has(event[0]) && !unavailable) void flushImportantEvents();
  } catch {
    // Analytics failures must not interrupt reservations.
    console.warn(`Analytics ${event[0]} could not be recorded.`);
  }
}

export function initializeAnalytics() {
  if (analytics || unavailable || typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_BAAS_API_KEY;
  if (!apiKey || !window.AnalyticsSDK) {
    disableAnalytics();
    return;
  }

  try {
    const client = new window.AnalyticsSDK(initializeBaasCore(), { appVersion });
    client.setAutomaticCollection(false);
    analytics = client;
    for (const event of pendingEvents.splice(0)) {
      void sendEvent(event);
    }
  } catch {
    disableAnalytics();
    console.warn("Analytics could not be initialized.");
  }
}

function canTrack() {
  return typeof window !== "undefined" && !unavailable && Boolean(process.env.NEXT_PUBLIC_BAAS_API_KEY);
}

function enqueueEvent(event: PendingEvent) {
  if (analytics) {
    void sendEvent(event);
  } else {
    if (pendingEvents.length >= 100) pendingEvents.shift();
    pendingEvents.push(event);
  }
}

export function logFoodProductView(foodId: number, price: number) {
  if (!canTrack()) return;

  enqueueEvent(["product_view", {
    product_id: `P-${foodId}`,
    category: "food",
    in_stock: true,
    price,
  }]);
}

export function logAuthEvent(name: AuthEventName, properties: AuthProperties, eventId?: string) {
  if (!canTrack()) return;
  try {
    const params: AuthParameters = {
      event_id: eventId ?? createAnalyticsId(),
      event_name: name,
      event_time: new Date().toISOString(),
      source: "frontend",
      platform: "web",
      app_version: appVersion,
    };
    if (properties.user_id) params.user_id = properties.user_id;
    if (properties.session_id) params.session_id = properties.session_id;
    if (properties.correlation_id) params.correlation_id = properties.correlation_id;
    if (properties.login_method) params.login_method = properties.login_method;
    if (properties.reason) params.reason = properties.reason;
    enqueueEvent([name, params]);
  } catch {
    console.warn("Analytics could not record the authentication event.");
  }
}

export function logAnalyticsError(context: ErrorEventContext, errorCode?: ErrorCode) {
  if (!canTrack()) return;

  try {
    logErrorOccurrence(createErrorOccurrence(context, errorCode));
  } catch {
    console.warn("Analytics could not create an error event.");
  }
}

export function logErrorOccurrence(occurrence: ErrorOccurrence) {
  if (!canTrack() || reportedErrorIds.has(occurrence.eventId)) return;

  let session: string | null = null;
  try {
    session = getSessionId();
  } catch {
    // The event can still be sent with its original ID if a session ID is unavailable.
  }

  if (reportedErrorIds.size >= 1_000) {
    const oldest = reportedErrorIds.values().next();
    if (!oldest.done) reportedErrorIds.delete(oldest.value);
  }
  reportedErrorIds.add(occurrence.eventId);

  enqueueEvent([occurrence.eventName, {
    event_id: occurrence.eventId,
    event_name: occurrence.eventName,
    event_time: occurrence.eventTime,
    ...(session ? { session_id: session } : {}),
    source: "frontend",
    platform: "web",
    app_version: appVersion,
    operation: occurrence.operation,
    ...(occurrence.errorCode ? { error_code: occurrence.errorCode } : {}),
    ...(occurrence.orderId == null ? {} : { order_id: occurrence.orderId }),
  }]);
}

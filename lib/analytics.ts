import {
  createAnalyticsId,
  createErrorOccurrence,
  type ErrorCode,
  type ErrorEventContext,
  type ErrorEventName,
  type ErrorOccurrence,
} from "./analytics-errors";

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
  user_id: null;
  session_id: string | null;
  source: "frontend";
  platform: "web";
  app_version: string;
  properties: { operation: string; error_code?: ErrorCode };
  order_id: number | null;
  correlation_id: null;
};

type PendingEvent = [name: "product_view", parameters: ProductView]
  | [name: ErrorEventName, parameters: ErrorParameters];

interface AnalyticsClient {
  logEvent(...event: PendingEvent): Promise<unknown>;
}

interface CoreClient {
  readonly SDK_VERSION: string;
}

declare global {
  interface Window {
    CoreSDK?: new (config: { apiKey: string }) => CoreClient;
    AnalyticsSDK?: new (core: CoreClient, config: { appVersion: string }) => AnalyticsClient;
  }
}

let analytics: AnalyticsClient | undefined;
let unavailable = false;
const pendingEvents: PendingEvent[] = [];
const reportedErrorIds = new Set<string>();
let sessionId: string | undefined;

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
    if (!unavailable) await analytics?.logEvent(...event);
  } catch {
    // Analytics failures must not interrupt reservations.
    console.warn(`Analytics ${event[0]} could not be recorded.`);
  }
}

export function initializeAnalytics() {
  if (analytics || unavailable || typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_BAAS_API_KEY;
  if (!apiKey || !window.CoreSDK || !window.AnalyticsSDK) {
    disableAnalytics();
    return;
  }

  try {
    const core = new window.CoreSDK({ apiKey });
    analytics = new window.AnalyticsSDK(core, { appVersion });
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
    user_id: null,
    session_id: session,
    source: "frontend",
    platform: "web",
    app_version: appVersion,
    properties: {
      operation: occurrence.operation,
      ...(occurrence.errorCode ? { error_code: occurrence.errorCode } : {}),
    },
    order_id: occurrence.orderId ?? null,
    correlation_id: null,
  }]);
}

import {
  createAnalyticsId,
  createErrorOccurrence,
  type ErrorCode,
  type ErrorEventContext,
  type ErrorEventName,
  type ErrorOccurrence,
} from "./analytics-errors";
import type { AnalyticsSdk } from "baas-web-sdk/analytics";
import { initializeBaasCore } from "./baas-core";

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

export type MenuEventName = "menu_viewed" | "menu_item_viewed" | "food_selected";
export type MenuProperties = {
  menu_date: string;
  meal_type?: "breakfast" | "lunch" | "dinner";
  food_id?: string;
  food_category?: string;
  food_price?: number;
  availability?: "available" | "unavailable";
};
type MenuParameters = Omit<AuthParameters, "event_name"> & MenuProperties & { event_name: MenuEventName };

export type OrderEventName = "order_started" | "order_created" | "order_modified" | "order_confirmed" | "order_cancelled";
export interface OrderOccurrence {
  event_id: string;
  event_time: string;
  event_name: OrderEventName;
  user_id?: string;
  session_id?: string;
  correlation_id?: string;
  order_id?: number | string;
  properties: {
    item_count?: number;
    order_amount?: number;
    order_status: "draft" | "reserved" | "cancelled";
    food_id?: string;
    meal_type?: "breakfast" | "lunch" | "dinner";
    order_date?: string;
  };
}
type OrderParameters = Omit<OrderOccurrence, "properties"> & OrderOccurrence["properties"] & {
  source: "frontend";
  platform: "web";
  app_version: string;
};

export type PaymentEventName = "checkout_started" | "payment_initiated" | "payment_succeeded"
  | "wallet_viewed" | "wallet_topup_started" | "wallet_payment_succeeded";
export interface PaymentOccurrence {
  event_name: PaymentEventName;
  event_id: string;
  event_time: string;
  user_id?: string;
  session_id?: string;
  correlation_id?: string;
  order_id?: number | string;
  properties: {
    transaction_id?: number | string;
    payment_method?: "gateway" | "wallet";
    amount?: number;
    currency?: "IRR";
    payment_status?: "started" | "initiated" | "succeeded";
  };
}
type PaymentParameters = Omit<PaymentOccurrence, "properties"> & PaymentOccurrence["properties"] & {
  source: "frontend";
  platform: "web";
  app_version: string;
};

export type FeedbackEventName = "comment_viewed" | "comment_submitted" | "rating_submitted";
type FeedbackParameters = Omit<AuthParameters, "event_name"> & {
  event_name: FeedbackEventName;
  food_id: string;
  order_id?: number;
  rating?: number;
};

export type InappEventName = "inapp_message_shown" | "inapp_message_clicked" | "inapp_message_dismissed";
type InappParameters = Omit<AuthParameters, "event_name"> & {
  event_name: InappEventName;
  message_id: string;
};

type PendingEvent = [name: MenuEventName, parameters: MenuParameters]
  | [name: ErrorEventName, parameters: ErrorParameters]
  | [name: AuthEventName, parameters: AuthParameters]
  | [name: OrderEventName, parameters: OrderParameters]
  | [name: PaymentEventName, parameters: PaymentParameters]
  | [name: FeedbackEventName, parameters: FeedbackParameters]
  | [name: InappEventName, parameters: InappParameters];

interface AnalyticsClient extends Pick<AnalyticsSdk, "flush" | "setUserId" | "clearUserId"> {
  logEvent(...event: PendingEvent): Promise<unknown>;
}

let analytics: AnalyticsClient | undefined;
let initializing: Promise<void> | undefined;
let identityUpdate = Promise.resolve(false);
let appliedUserId: string | null | undefined;
let unavailable = false;
const pendingEvents: PendingEvent[] = [];
const reportedErrorIds = new Set<string>();
let sessionId: string | undefined;
const immediateEvents = new Set<PendingEvent[0]>([
  "login_started", "login_completed", "login_failed", "session_started", "session_ended",
  "order_error", "payment_error", "menu_load_failed", "api_error",
  "order_started", "order_created", "order_modified", "order_confirmed", "order_cancelled",
  "checkout_started", "wallet_topup_started", "payment_initiated", "payment_succeeded", "wallet_payment_succeeded",
  "comment_submitted", "rating_submitted",
  "inapp_message_clicked", "inapp_message_dismissed",
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
  await Promise.resolve();
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
  if (analytics || unavailable || typeof window === "undefined" || !process.env.NEXT_PUBLIC_BAAS_API_KEY) return;
  initializing ??= Promise.all([import("baas-web-sdk/analytics"), initializeBaasCore()]).then(([{ AnalyticsSdk }, core]) => {
    // The package repeats CoreSdk's private declarations in each subpath's types.
    const client = new AnalyticsSdk(core as unknown as ConstructorParameters<typeof AnalyticsSdk>[0], { appVersion });
    client.setAutomaticCollection(false);
    analytics = client;
    for (const event of pendingEvents.splice(0)) {
      void sendEvent(event);
    }
  }).catch(() => {
    disableAnalytics();
    console.warn("Analytics could not be initialized.");
  });
  return initializing;
}

export function syncAnalyticsUserId(userId: string | null) {
  if (!canTrack()) return;

  // A logout must finish after any in-flight setUserId request.
  identityUpdate = identityUpdate.then(async () => {
    await initializeAnalytics();
    if (!analytics || unavailable) return false;
    if (appliedUserId === userId) return true;

    appliedUserId = undefined;
    const result = userId === null
      ? await analytics.clearUserId()
      : await analytics.setUserId(userId);
    if (result.success) appliedUserId = userId;
    else console.error(result.error);
    return result.success;
  }).catch((error: unknown) => {
    console.error("Analytics user ID could not be synchronized.", error);
    return false;
  });
  return identityUpdate;
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

export function logOrderEvent(event: OrderOccurrence) {
  if (!canTrack()) return;
  try {
    const { properties, ...envelope } = event;
    enqueueEvent([event.event_name, {
      ...envelope,
      ...properties,
      source: "frontend",
      platform: "web",
      app_version: appVersion,
    }]);
  } catch {
    console.warn("Analytics could not record the order event.");
  }
}

export function logPaymentEvent(event: PaymentOccurrence) {
  if (!canTrack()) return;
  try {
    const { properties, ...envelope } = event;
    enqueueEvent([event.event_name, {
      ...envelope,
      ...properties,
      source: "frontend",
      platform: "web",
      app_version: appVersion,
    }]);
  } catch {
    console.warn("Analytics could not record the payment event.");
  }
}

export function logFeedbackEvent(name: FeedbackEventName, context: {
  foodId: number;
  orderId?: number;
  rating?: number;
  identity: { user_id?: string; session_id?: string };
  eventTime?: string;
}) {
  if (!canTrack()) return;
  try {
    if (!Number.isSafeInteger(context.foodId) || context.foodId <= 0) return;
    enqueueEvent([name, {
      event_id: createAnalyticsId(),
      event_name: name,
      event_time: context.eventTime ?? new Date().toISOString(),
      source: "frontend",
      platform: "web",
      app_version: appVersion,
      food_id: `food_${context.foodId}`,
      ...(context.orderId && Number.isSafeInteger(context.orderId) && context.orderId > 0 ? { order_id: context.orderId } : {}),
      ...(context.identity.user_id ? { user_id: context.identity.user_id } : {}),
      ...(context.identity.session_id ? { session_id: context.identity.session_id } : {}),
      ...(typeof context.rating === "number" && Number.isInteger(context.rating) && context.rating >= 1 && context.rating <= 5
        ? { rating: context.rating } : {}),
    }]);
  } catch {
    console.warn("Analytics could not record the feedback event.");
  }
}

export function logInappEvent(name: InappEventName, context: {
  messageId: string;
  displayId: string;
  identity: { user_id?: string; session_id?: string };
}) {
  if (!canTrack()) return;
  try {
    enqueueEvent([name, {
      event_id: createAnalyticsId(),
      event_name: name,
      event_time: new Date().toISOString(),
      source: "frontend",
      platform: "web",
      app_version: appVersion,
      message_id: context.messageId,
      correlation_id: context.displayId,
      ...(context.identity.user_id ? { user_id: context.identity.user_id } : {}),
      ...(context.identity.session_id ? { session_id: context.identity.session_id } : {}),
    }]);
  } catch {
    console.warn("Analytics could not record the in-app message event.");
  }
}

export function logMenuEvent(name: MenuEventName, properties: MenuProperties, identity: { user_id?: string; session_id?: string }) {
  if (!canTrack()) return;
  try {
    enqueueEvent([name, {
      event_id: createAnalyticsId(),
      event_name: name,
      event_time: new Date().toISOString(),
      source: "frontend",
      platform: "web",
      app_version: appVersion,
      ...(identity.user_id ? { user_id: identity.user_id } : {}),
      ...(identity.session_id ? { session_id: identity.session_id } : {}),
      ...properties,
    }]);
  } catch {
    console.warn("Analytics could not record the menu event.");
  }
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

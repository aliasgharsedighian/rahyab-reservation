import type { ReserveCartItem } from "@/app/dashboard/reserve/types";
import { logOrderEvent, type OrderEventName, type OrderOccurrence } from "./analytics";
import { createAnalyticsId } from "./analytics-errors";
import { getAnalyticsIdentity } from "./auth-analytics";

type Identity = ReturnType<typeof getAnalyticsIdentity>;
interface OrderAttempt {
  correlationId: string;
  identity: Identity;
}

const storageKey = "foodnix.analytics.order-attempt";
let memoryAttempt: OrderAttempt | null = null;

function readAttempt(): OrderAttempt | null {
  let value = memoryAttempt;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    value = JSON.parse(raw) as OrderAttempt;
  } catch {
    // Reuse the active in-memory attempt if persistent storage is unavailable.
  }
  if (typeof value?.correlationId !== "string" || !/^[0-9a-f-]{36}$/i.test(value.correlationId)) return null;
  const identity = getAnalyticsIdentity(null);
  if (value.identity?.session_id !== identity.session_id || value.identity?.user_id !== identity.user_id) return null;
  return { correlationId: value.correlationId, identity };
}

function saveAttempt(attempt: OrderAttempt | null) {
  memoryAttempt = attempt;
  try {
    if (attempt) localStorage.setItem(storageKey, JSON.stringify(attempt));
    else localStorage.removeItem(storageKey);
  } catch {
    // The active flow can still be tracked in this tab when storage is blocked.
  }
}

function cartProperties(items: ReserveCartItem[], status: OrderOccurrence["properties"]["order_status"], changed?: ReserveCartItem) {
  const itemCount = items.reduce((total, item) => total + item.count, 0);
  const amount = items.reduce((total, item) => total + item.count * item.price, 0);
  const reference = changed ?? (items.length === 1 ? items[0] : undefined);
  const dates = new Set(items.map(item => item.date));
  const meals = new Set(items.map(item => item.type));
  const date = reference?.date ?? (dates.size === 1 ? items[0]?.date : undefined);
  const type = reference?.type ?? (meals.size === 1 ? items[0]?.type : undefined);
  return {
    item_count: itemCount,
    order_amount: amount,
    order_status: status,
    ...(reference?.food_id ? { food_id: `food_${reference.food_id}` } : {}),
    ...(date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { order_date: date } : {}),
    ...(type === "breakfast" || type === "lunch" || type === "dinner" ? { meal_type: type } : {}),
  };
}

function emit(name: OrderEventName, attempt: OrderAttempt, properties: OrderOccurrence["properties"], orderId?: number | string) {
  const identity = attempt.identity;
  logOrderEvent({
    event_name: name,
    event_id: createAnalyticsId(),
    event_time: new Date().toISOString(),
    ...(identity.user_id ? { user_id: identity.user_id } : {}),
    ...(identity.session_id ? { session_id: identity.session_id } : {}),
    correlation_id: attempt.correlationId,
    ...(orderId == null ? {} : { order_id: orderId }),
    properties,
  });
}

function ensureAttempt(items: ReserveCartItem[]) {
  const existing = readAttempt();
  if (existing) return existing;
  const attempt = { correlationId: createAnalyticsId(), identity: getAnalyticsIdentity(null) };
  saveAttempt(attempt);
  emit("order_started", attempt, cartProperties(items, "draft"));
  return attempt;
}

export function trackCartChange(before: ReserveCartItem[], after: ReserveCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    const changed = new Map<string, ReserveCartItem>();
    for (const item of before) {
      const next = after.find(entry => entry.id === item.id);
      if (!next || next.count !== item.count || next.price !== item.price) changed.set(String(item.id), next ?? item);
    }
    for (const item of after) {
      if (!before.some(entry => entry.id === item.id)) changed.set(String(item.id), item);
    }
    if (!changed.size) return;
    const item = changed.size === 1 ? changed.values().next().value : undefined;
    if (!before.length && after.length) {
      saveAttempt(null);
      const attempt = ensureAttempt(after);
      emit("order_created", attempt, cartProperties(after, "draft", item));
      return;
    }
    const attempt = ensureAttempt(before);
    emit(after.length ? "order_modified" : "order_cancelled", attempt,
      cartProperties(after, after.length ? "draft" : "cancelled", item));
    if (!after.length) saveAttempt(null);
  } catch {
    console.warn("Analytics could not record the cart change.");
  }
}

export function startOrderCheckout(items: ReserveCartItem[]) {
  try {
    if (items.length) return ensureAttempt(items).correlationId;
  } catch {
    console.warn("Analytics could not record checkout start.");
  }
}

export function finishOrderAttempt() {
  saveAttempt(null);
}

export function confirmCartOrder(items: ReserveCartItem[], response: unknown) {
  try {
    const body = response as { order_id?: unknown; data?: { order_id?: unknown } } | null;
    const candidate = body?.order_id ?? body?.data?.order_id;
    let orderId: number | string | undefined;
    if (typeof candidate === "number" && Number.isSafeInteger(candidate) && candidate > 0) orderId = candidate;
    if (typeof candidate === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(candidate)) orderId = candidate;
    const attempt = ensureAttempt(items);
    emit("order_confirmed", attempt, cartProperties(items, "reserved"), orderId);
    finishOrderAttempt();
  } catch {
    console.warn("Analytics could not record order confirmation.");
  }
}

export function trackReservationCancelled(orderId: number, reservation?: { food_id: number; quantity: number; total_paid: number }) {
  try {
    const identity = getAnalyticsIdentity(null);
    logOrderEvent({
      event_name: "order_cancelled",
      event_id: createAnalyticsId(),
      event_time: new Date().toISOString(),
      ...(identity.user_id ? { user_id: identity.user_id } : {}),
      ...(identity.session_id ? { session_id: identity.session_id } : {}),
      order_id: orderId,
      properties: {
        order_status: "cancelled",
        ...(reservation ? { item_count: reservation.quantity, order_amount: reservation.total_paid } : {}),
        ...(reservation?.food_id ? { food_id: `food_${reservation.food_id}` } : {}),
      },
    });
  } catch {
    console.warn("Analytics could not record reservation cancellation.");
  }
}

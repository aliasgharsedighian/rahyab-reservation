import { logPaymentEvent, type PaymentEventName, type PaymentOccurrence } from "./analytics";
import { createAnalyticsId } from "./analytics-errors";
import { getAnalyticsIdentity } from "./auth-analytics";

export interface PaymentAttempt {
  correlationId: string;
  amount?: number;
  identity: ReturnType<typeof getAnalyticsIdentity>;
}

const deduplicationKey = "foodnix.analytics.payment-events";
const reported = new Set<string>();

function once(key: string, record: () => void) {
  let saved: string[] = [];
  try {
    const value: unknown = JSON.parse(localStorage.getItem(deduplicationKey) ?? "[]");
    if (Array.isArray(value)) saved = value.filter((entry): entry is string => typeof entry === "string").slice(-500);
  } catch {
    // In-memory deduplication remains available without browser storage.
  }
  if (reported.has(key) || saved.includes(key)) return;
  if (reported.size >= 500) reported.clear();
  reported.add(key);
  try {
    localStorage.setItem(deduplicationKey, JSON.stringify([...saved, key].slice(-500)));
  } catch {
    // Payment must continue even if browser storage cannot be updated.
  }
  record();
}

function emit(name: PaymentEventName, properties: PaymentOccurrence["properties"], attempt?: PaymentAttempt, orderId?: number | string) {
  const identity = attempt?.identity ?? getAnalyticsIdentity(null);
  logPaymentEvent({
    event_name: name,
    event_id: createAnalyticsId(),
    event_time: new Date().toISOString(),
    ...(identity.user_id ? { user_id: identity.user_id } : {}),
    ...(identity.session_id ? { session_id: identity.session_id } : {}),
    ...(attempt ? { correlation_id: attempt.correlationId } : {}),
    ...(orderId == null ? {} : { order_id: orderId }),
    properties,
  });
}

function amountProperties(amount: number | undefined): { amount?: number; currency?: "IRR" } {
  return amount !== undefined && Number.isSafeInteger(amount) && amount >= 0 ? { amount, currency: "IRR" } : {};
}

export function beginCheckout(correlationId: string | undefined, amountTomans: number, walletOnly: boolean): PaymentAttempt | undefined {
  try {
    if (!correlationId) return;
    const amount = amountProperties(amountTomans * 10).amount;
    const attempt = { correlationId, amount, identity: getAnalyticsIdentity(null) };
    once(`checkout:${correlationId}`, () => emit("checkout_started", {
      ...amountProperties(amount),
      ...(walletOnly ? { payment_method: "wallet" } as const : {}),
      payment_status: "started",
    }, attempt));
    return attempt;
  } catch {
    console.warn("Analytics could not record checkout start.");
  }
}

export function beginWalletTopup(amountRials: number): PaymentAttempt | undefined {
  try {
    const attempt = { correlationId: createAnalyticsId(), amount: amountRials, identity: getAnalyticsIdentity(null) };
    emit("wallet_topup_started", {
      ...amountProperties(amountRials), payment_method: "gateway", payment_status: "started",
    }, attempt);
    return attempt;
  } catch {
    console.warn("Analytics could not record wallet top-up start.");
  }
}

export function trackWalletViewed() {
  try {
    emit("wallet_viewed", {});
  } catch {
    console.warn("Analytics could not record wallet view.");
  }
}

function referenceId(value: unknown): number | string | undefined {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) return value;
  if (typeof value === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(value)) return value;
}

function responseIds(response: unknown) {
  const body = response as { transaction_id?: unknown; order_id?: unknown; data?: { transaction_id?: unknown; order_id?: unknown } } | null;
  return {
    transactionId: referenceId(body?.transaction_id ?? body?.data?.transaction_id),
    orderId: referenceId(body?.order_id ?? body?.data?.order_id),
  };
}

export function trackGatewayInitiated(response: unknown, attempt: PaymentAttempt | undefined, walletTopup: boolean) {
  try {
    const { transactionId, orderId } = responseIds(response);
    if (transactionId === undefined) return;
    once(`initiated:gateway:${transactionId}`, () => emit("payment_initiated", {
      transaction_id: transactionId,
      payment_method: "gateway",
      payment_status: "initiated",
      // The online order gateway may charge only a deficit, whose amount is unknown.
      ...(walletTopup ? amountProperties(attempt?.amount) : {}),
    }, attempt, walletTopup ? undefined : orderId));
  } catch {
    console.warn("Analytics could not record gateway initiation.");
  }
}

export function trackWalletPaymentSucceeded(response: unknown, attempt: PaymentAttempt | undefined) {
  try {
    const { transactionId, orderId } = responseIds(response);
    if (transactionId === undefined || orderId === undefined) return;
    const properties = {
      transaction_id: transactionId, payment_method: "wallet", payment_status: "succeeded",
      ...amountProperties(attempt?.amount),
    } as const;
    once(`succeeded:wallet:${transactionId}`, () => emit("payment_succeeded", properties, attempt, orderId));
    once(`wallet-payment:${transactionId}`, () => emit("wallet_payment_succeeded", properties, attempt, orderId));
  } catch {
    console.warn("Analytics could not record the wallet payment result.");
  }
}

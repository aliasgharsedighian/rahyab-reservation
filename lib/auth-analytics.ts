import { logAuthEvent, syncAnalyticsUserId } from "./analytics";
import { createAnalyticsId } from "./analytics-errors";

type LoginMethod = "otp" | "password";
type SessionEndReason = "logout" | "expired" | "disabled";

export interface LoginAttempt {
  correlationId: string;
  method: LoginMethod;
  finished: boolean;
}

interface AnalyticsSession {
  sessionId: string;
  userId: string | null;
  endEventId: string;
}

const sessionKey = "foodnix.analytics.auth-session";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
let memorySession: AnalyticsSession | null = null;
let pendingLogin: {
  user_id?: string;
  session_id: string;
  correlation_id?: string;
  login_method?: LoginMethod;
} | undefined;

function readSession(): AnalyticsSession | null {
  try {
    const value = localStorage.getItem(sessionKey);
    if (!value) return null;
    const session = JSON.parse(value) as Partial<AnalyticsSession> | null;
    if (typeof session?.sessionId !== "string" || !session.sessionId.startsWith("ses_")
      || !uuid.test(session.sessionId.slice(4)) || typeof session.endEventId !== "string"
      || !uuid.test(session.endEventId)) return null;

    return {
      sessionId: session.sessionId,
      endEventId: session.endEventId,
      userId: typeof session.userId === "string" && /^usr_[0-9a-f]{32}$/.test(session.userId) ? session.userId : null,
    };
  } catch {
    return memorySession;
  }
}

function writeSession(session: AnalyticsSession | null) {
  memorySession = session;
  try {
    if (session) localStorage.setItem(sessionKey, JSON.stringify(session));
    else localStorage.removeItem(sessionKey);
  } catch {
    // Keep the session in memory when storage is blocked.
  }
}

export function beginLoginAttempt(method: LoginMethod): LoginAttempt | null {
  try {
    const correlationId = createAnalyticsId();
    logAuthEvent("login_started", { correlation_id: correlationId, login_method: method });
    return { correlationId, method, finished: false };
  } catch {
    return null;
  }
}

export function failLoginAttempt(attempt: LoginAttempt | null) {
  if (!attempt || attempt.finished) return;
  attempt.finished = true;
  logAuthEvent("login_failed", { correlation_id: attempt.correlationId, login_method: attempt.method });
}

export function completeLoginAttempt(attempt: LoginAttempt | null, userId: string | null) {
  if (attempt?.finished) return;
  if (attempt) attempt.finished = true;
  try {
    const session = { sessionId: `ses_${createAnalyticsId()}`, userId, endEventId: createAnalyticsId() };
    writeSession(session);
    // The dashboard profile supplies the SDK user ID after navigation.
    pendingLogin = {
      user_id: userId ?? undefined,
      session_id: session.sessionId,
      correlation_id: attempt?.correlationId,
      login_method: attempt?.method,
    };
  } catch {
    // Analytics must not interfere with the established application session.
  }
}

export async function syncAuthAnalyticsIdentity(profileUserId: string | null) {
  if (profileUserId === null) pendingLogin = undefined;
  const login = pendingLogin;
  const synced = await syncAnalyticsUserId(profileUserId);
  if (!synced || !login || pendingLogin !== login) return;

  pendingLogin = undefined;
  logAuthEvent("login_completed", login);
  logAuthEvent("session_started", login);
}

export function endAnalyticsSession(reason: SessionEndReason, expectedSessionId = getAnalyticsSessionId()) {
  if (!expectedSessionId) return;
  if (pendingLogin?.session_id === expectedSessionId) pendingLogin = undefined;
  const end = () => {
    const session = readSession();
    if (session?.sessionId !== expectedSessionId) return;
    writeSession(null);
    logAuthEvent("session_ended", {
      user_id: session.userId ?? undefined,
      session_id: session.sessionId,
      reason,
    }, session.endEventId);
  };
  try {
    if (navigator.locks) {
      void navigator.locks.request(sessionKey, end).catch(end);
      return;
    }
  } catch {
    // Use the persisted session and its fixed end event ID without Web Locks.
  }
  end();
}

export function getAnalyticsSessionId() {
  return readSession()?.sessionId;
}

export function getAnalyticsIdentity(userId: string | null) {
  const session = readSession();
  return {
    user_id: userId ?? session?.userId ?? undefined,
    session_id: userId && session?.userId && userId !== session.userId ? undefined : session?.sessionId,
  };
}

export function logProfileViewed(userId: string | null) {
  const session = readSession();
  if (userId && session && !session.userId) writeSession({ ...session, userId });
  logAuthEvent("profile_viewed", {
    user_id: userId ?? session?.userId ?? undefined,
    session_id: userId && session?.userId && userId !== session.userId ? undefined : session?.sessionId,
  });
}

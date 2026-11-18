import { initializeBaasCore } from "./baas-core";

interface PushClient {
  start(): Promise<NotificationPermission>;
  disconnect(): void;
  onError(listener: (error: unknown) => void): () => void;
}

type PushStatus = "unconfigured" | "unsupported" | "loading" | "unavailable"
  | "ready" | "starting" | "enabled" | "denied" | "failed";

let push: PushClient | undefined;
let initializing: Promise<void> | undefined;
let sdkFailed = false;
let worker: "loading" | "ready" | "failed" = "loading";
let phase: "idle" | "starting" | "enabled" | "failed" = "idle";
let dashboardActive = false;
const listeners = new Set<() => void>();

function publish() {
  for (const listener of listeners) listener();
}

function isSupported() {
  return typeof window !== "undefined" && window.isSecureContext
    && "Notification" in window && "WebSocket" in window && "serviceWorker" in navigator;
}

export function subscribeToPush(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getPushStatus(): PushStatus {
  if (!process.env.NEXT_PUBLIC_BAAS_API_KEY) return "unconfigured";
  if (!isSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (sdkFailed || worker === "failed") return "unavailable";
  if (!push || worker !== "ready") return "loading";
  return phase === "idle" ? "ready" : phase;
}

export function setPushWorkerStatus(status: "ready" | "failed") {
  worker = status;
  publish();
}

export function disablePushSdk() {
  sdkFailed = true;
  publish();
}

export function initializePushSdk() {
  if (push || !isSupported()) return;
  initializing ??= Promise.all([import("baas-web-sdk/push"), initializeBaasCore()]).then(([{ PushSdk }, core]) => {
    const client = new PushSdk(core as unknown as ConstructorParameters<typeof PushSdk>[0]);
    client.onError(() => {
      console.warn("BaaS Push connection reported an error.");
      if (dashboardActive && phase !== "starting") {
        phase = "failed";
        publish();
      }
    });
    push = client;
    sdkFailed = false;
    publish();
  }).catch(() => {
    disablePushSdk();
  });
  return initializing;
}

export async function startBaasPush() {
  const status = getPushStatus();
  if (!dashboardActive || !push || (status !== "ready" && status !== "failed")) return;

  phase = "starting";
  publish();
  try {
    // start() requests permission immediately when called from the enable button.
    const permission = await push.start();
    phase = dashboardActive && permission === "granted" ? "enabled" : "idle";
    if (!dashboardActive) push.disconnect();
  } catch {
    phase = dashboardActive ? "failed" : "idle";
    console.warn("BaaS Push could not be started.");
  }
  publish();
}

export function activateBaasPush() {
  dashboardActive = true;
  const resume = () => {
    if (dashboardActive && getPushStatus() === "ready" && Notification.permission === "granted") {
      void startBaasPush();
    }
  };
  const pause = () => {
    dashboardActive = false;
    if (phase !== "idle") push?.disconnect();
    if (phase !== "starting") phase = "idle";
    publish();
  };
  const restore = () => {
    dashboardActive = true;
    publish();
  };
  const syncPermission = () => {
    if (phase === "enabled" && Notification.permission !== "granted") {
      push?.disconnect();
      phase = "idle";
    }
    publish();
  };
  const unsubscribe = subscribeToPush(resume);
  resume();

  window.addEventListener("pagehide", pause);
  window.addEventListener("pageshow", restore);
  window.addEventListener("focus", syncPermission);
  return () => {
    unsubscribe();
    window.removeEventListener("pagehide", pause);
    window.removeEventListener("pageshow", restore);
    window.removeEventListener("focus", syncPermission);
    pause();
  };
}

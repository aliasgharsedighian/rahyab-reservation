import { initializeBaasCore } from "./baas-core";
import { getInstallState, subscribeToInstall } from "./pwa-install";
import { getPushInstallation, subscribeToPushInstallation } from "./push-installation-sync";

interface PushClient {
  start(): Promise<NotificationPermission>;
  disconnect(): void;
  onError(listener: (error: unknown) => void): () => void;
}

type PushStatus = "unconfigured" | "install-required" | "unsupported" | "loading" | "unavailable"
  | "ready" | "prompting" | "starting" | "enabled" | "denied" | "failed";

let push: PushClient | undefined;
let initializing: Promise<void> | undefined;
let sdkFailed = false;
let worker: "loading" | "ready" | "failed" = "loading";
let phase: "idle" | "starting" | "enabled" | "failed" = "idle";
let dashboardActive = false;
let requestingPermission = false;
const listeners = new Set<() => void>();

function publish() {
  for (const listener of listeners) listener();
}

function isSupported() {
  return typeof window !== "undefined" && window.isSecureContext
    && "Notification" in window && "WebSocket" in window && "serviceWorker" in navigator;
}

function canReceivePush() {
  return dashboardActive && getPushInstallation().status === "on"
    && isSupported() && Notification.permission === "granted";
}

export function subscribeToPush(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getPushStatus(): PushStatus {
  if (!process.env.NEXT_PUBLIC_BAAS_API_KEY) return "unconfigured";
  const { platform, standalone } = getInstallState();
  if (platform === "unknown") return "loading";
  if ((platform === "ios" || platform === "android") && !standalone) return "install-required";
  if (!isSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (sdkFailed || worker === "failed") return "unavailable";
  if (!push || worker !== "ready") return "loading";
  if (requestingPermission) return "prompting";
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
      if (canReceivePush() && phase !== "starting") {
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
  if (!canReceivePush() || !push || (status !== "ready" && status !== "failed")) return;

  phase = "starting";
  publish();
  try {
    // The SDK restores its installation token and connection with the existing grant.
    const permission = await push.start();
    phase = canReceivePush() && permission === "granted" ? "enabled" : "idle";
    if (phase === "idle") push.disconnect();
  } catch {
    phase = canReceivePush() ? "failed" : "idle";
    console.warn("BaaS Push could not be started.");
  }
  publish();
}

export async function requestBaasPushPermission() {
  const status = getPushStatus();
  if (!dashboardActive || (status !== "ready" && status !== "failed")) return;
  try {
    if (Notification.permission === "default") {
      requestingPermission = true;
      try {
        const request = Notification.requestPermission();
        publish();
        await request;
      } finally {
        requestingPermission = false;
      }
    }
    await startBaasPush();
    return Notification.permission;
  } finally {
    publish();
  }
}

export function activateBaasPush() {
  dashboardActive = true;
  const resume = () => {
    if (canReceivePush() && getPushStatus() === "ready") {
      void startBaasPush();
    }
  };
  const syncInstallation = () => {
    if (!canReceivePush() && phase !== "idle" && phase !== "starting") {
      push?.disconnect();
      phase = "idle";
    }
    publish();
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
    if (phase !== "idle" && phase !== "starting" && isSupported() && Notification.permission !== "granted") {
      push?.disconnect();
      phase = "idle";
    }
    publish();
  };
  const onVisible = () => { if (document.visibilityState === "visible") syncPermission(); };
  const unsubscribe = subscribeToPush(resume);
  const unsubscribeInstall = subscribeToInstall(syncPermission);
  const unsubscribeInstallation = subscribeToPushInstallation(syncInstallation);
  let permissionStatus: PermissionStatus | undefined;
  let disposed = false;
  void navigator.permissions?.query({ name: "notifications" }).then((result) => {
    if (disposed) return;
    permissionStatus = result;
    result.addEventListener("change", syncPermission);
    syncPermission();
  }).catch(() => { /* Focus and visibility also refresh permission. */ });
  resume();

  window.addEventListener("pagehide", pause);
  window.addEventListener("pageshow", restore);
  window.addEventListener("focus", syncPermission);
  document.addEventListener("visibilitychange", onVisible);
  return () => {
    disposed = true;
    permissionStatus?.removeEventListener("change", syncPermission);
    unsubscribe();
    unsubscribeInstall();
    unsubscribeInstallation();
    window.removeEventListener("pagehide", pause);
    window.removeEventListener("pageshow", restore);
    window.removeEventListener("focus", syncPermission);
    document.removeEventListener("visibilitychange", onVisible);
    pause();
  };
}

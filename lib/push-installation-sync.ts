"use client";

import { getBaasInstallationId } from "./baas-core";
import { subscribeToBaasInstallation } from "./baas-installation";

const RETRY_DELAYS_MS = [5000, 15000, 30000];
let active = false;
let session = 0;
let settledId: string | undefined;
let running = false;
let queued = false;
let failures = 0;
let retryTimer: number | undefined;

async function register(currentSession: number) {
  if (!active || currentSession !== session) return;
  const id = await getBaasInstallationId();
  if (!id) throw new Error("BaaS installation ID is unavailable.");

  const send = async () => {
    if (!active || currentSession !== session || id === settledId) return;
    const response = await fetch("/api/push/installations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: id, platform: "web" }),
      signal: AbortSignal.timeout(15000),
    });
    if (response.status !== 200 && response.status !== 401 && response.status !== 422) {
      throw new Error("Push installation registration failed.");
    }
    if (currentSession === session) settledId = id;
  };

  // Only hold the cross-tab lock during the write, once the SDK has supplied the ID.
  if (navigator.locks) await navigator.locks.request("foodnix:push-installation", send);
  else await send();
}

async function drainQueue() {
  running = true;
  try {
    while (active && queued) {
      queued = false;
      const currentSession = session;
      try {
        await register(currentSession);
        failures = 0;
      } catch {
        const delay = RETRY_DELAYS_MS[failures++];
        if (active && currentSession === session && !queued && delay !== undefined) {
          retryTimer = window.setTimeout(queueSync, delay);
        }
      }
    }
  } finally {
    running = false;
  }
}

function queueSync() {
  if (!active) return;
  window.clearTimeout(retryTimer);
  queued = true;
  if (!running) void drainQueue();
}

function syncNow() {
  failures = 0;
  queueSync();
}

export function syncPushInstallationAfterLogin() {
  if (!process.env.NEXT_PUBLIC_BAAS_API_KEY) return;
  active = true;
  session++;
  settledId = undefined;
  syncNow();
}

export function observePushInstallation() {
  if (!process.env.NEXT_PUBLIC_BAAS_API_KEY) return;
  active = true;
  const unsubscribe = subscribeToBaasInstallation(syncNow);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== "token" && event.key !== null) return;
    if (event.newValue) {
      syncPushInstallationAfterLogin();
    } else {
      active = false;
      session++;
      settledId = undefined;
      window.clearTimeout(retryTimer);
    }
  };
  const onPageShow = (event: PageTransitionEvent) => {
    if (!active) return;
    if (event.persisted) settledId = undefined;
    syncNow();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("online", syncNow);
  window.addEventListener("focus", syncNow);
  window.addEventListener("pageshow", onPageShow);
  syncNow();
  return () => {
    active = false;
    window.clearTimeout(retryTimer);
    unsubscribe();
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("online", syncNow);
    window.removeEventListener("focus", syncNow);
    window.removeEventListener("pageshow", onPageShow);
  };
}

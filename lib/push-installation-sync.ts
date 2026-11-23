"use client";

import { getBaasInstallationId } from "./baas-core";
import { subscribeToBaasInstallation } from "./baas-installation";

const ENDPOINT = "/api/push/installations";
const CHANGE_KEY = "foodnix:push-installation-change";

interface InstallationState {
  status: "loading" | "on" | "off" | "error";
  changing: "on" | "off" | null;
}

const initialState: InstallationState = { status: "loading", changing: null };
const listeners = new Set<() => void>();
let state = initialState;
let active = false;
let revision = 0;
let checking = false;
let refreshQueued = false;

export const getPushInstallation = () => state;
export const getInitialPushInstallation = () => initialState;
export function subscribeToPushInstallation(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function publish(next: InstallationState) {
  if (state.status === next.status && state.changing === next.changing) return;
  state = next;
  for (const listener of listeners) listener();
}

function reset() {
  revision++;
  checking = false;
  refreshQueued = false;
  publish(initialState);
}

export async function refreshPushInstallation(showLoading = false) {
  if (!active) return;
  if (checking || state.changing) {
    refreshQueued = true;
    return;
  }
  refreshQueued = false;
  const current = revision;
  checking = true;
  if (showLoading && state.status === "error") publish(initialState);
  try {
    const id = await getBaasInstallationId();
    if (!active || current !== revision) return;
    if (!id) throw new Error("BaaS installation ID is unavailable.");
    const response = await fetch(`${ENDPOINT}?${new URLSearchParams({ device_id: id })}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 401) {
      if (current === revision) publish({ status: "error", changing: null });
      return;
    }
    if (!response.ok) throw new Error("Push installation lookup failed.");
    const { active: registered } = await response.json();
    if (typeof registered !== "boolean") throw new Error("Invalid push installation status.");
    if (current === revision) publish({ status: registered ? "on" : "off", changing: null });
  } catch {
    if (current === revision && (state.status === "loading" || state.status === "error")) {
      publish({ status: "error", changing: null });
    }
  } finally {
    if (current === revision) {
      checking = false;
      if (refreshQueued) void refreshPushInstallation();
    }
  }
}

export async function setPushInstallationEnabled(enabled: boolean) {
  if (!active || state.changing) return false;
  const current = ++revision;
  const previousStatus = state.status;
  checking = false;
  publish({ status: previousStatus, changing: enabled ? "on" : "off" });

  try {
    const id = await getBaasInstallationId();
    if (!id) throw new Error("BaaS installation ID is unavailable.");
    const write = async () => {
      if (!active || current !== revision) return false;
      const response = await fetch(ENDPOINT, {
        method: enabled ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: id, platform: "web" }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error("Push installation update failed.");
      try {
        localStorage.setItem(CHANGE_KEY, `${Date.now()}:${Math.random()}`);
      } catch {
        // Other tabs can still refresh on focus.
      }
      return true;
    };
    const updated = navigator.locks
      ? await navigator.locks.request("foodnix:push-installation", write)
      : await write();
    if (!updated || current !== revision) return false;
    publish({ status: enabled ? "on" : "off", changing: null });
    return true;
  } catch {
    if (current === revision) publish({ status: previousStatus, changing: null });
    return false;
  } finally {
    // Recheck the current device after an update or an ambiguous network failure.
    if (current === revision) void refreshPushInstallation();
  }
}

export function observePushInstallation() {
  if (!process.env.NEXT_PUBLIC_BAAS_API_KEY) return;
  active = true;
  const refresh = () => { void refreshPushInstallation(); };
  const unsubscribe = subscribeToBaasInstallation(refresh);
  const onStorage = (event: StorageEvent) => {
    if (event.key === "token" || event.key === null) {
      active = !!event.newValue;
      reset();
    }
    if (event.key === CHANGE_KEY || event.key === "token") refresh();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("online", refresh);
  window.addEventListener("focus", refresh);
  window.addEventListener("pageshow", refresh);
  refresh();
  return () => {
    active = false;
    reset();
    unsubscribe();
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("online", refresh);
    window.removeEventListener("focus", refresh);
    window.removeEventListener("pageshow", refresh);
  };
}

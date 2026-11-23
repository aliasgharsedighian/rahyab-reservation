import type { DeviceData } from "baas-web-sdk/core";
import { isPushDeviceId } from "./push-device";

const STORAGE_KEY = "foodnix:baas-installation";
const listeners = new Set<() => void>();
let installation: { token: string; id: string } | undefined;

async function tokenHash(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function rememberBaasInstallation(data?: DeviceData) {
  if (!isPushDeviceId(data?.installationId) || !data.token) return;
  const current = { token: data.token, id: data.installationId };
  const changed = installation?.id !== current.id;
  installation = current;
  try {
    const hash = await tokenHash(current.token);
    if (installation === current) localStorage.setItem(STORAGE_KEY, JSON.stringify({ hash, id: current.id }));
  } catch {
    // Keep the ID in memory if persistent storage or Web Crypto is unavailable.
  }
  if (changed) for (const listener of listeners) listener();
}

export async function readBaasInstallationId(token: string) {
  if (installation?.token === token) return installation.id;
  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (isPushDeviceId(cached?.id) && cached.hash === await tokenHash(token)) return cached.id;
  } catch {
    // An installation created before ID tracking can be recovered through the SDK.
  }
}

export function subscribeToBaasInstallation(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

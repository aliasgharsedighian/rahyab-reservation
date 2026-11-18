import type { CoreSdk } from "baas-web-sdk/core";

let corePromise: Promise<CoreSdk> | undefined;
let authPromise: Promise<void> | undefined;

export function initializeBaasCore() {
  if (typeof window === "undefined") throw new Error("BaaS requires a browser.");
  if (corePromise) return corePromise;
  const apiKey = process.env.NEXT_PUBLIC_BAAS_API_KEY;
  if (!apiKey) throw new Error("BaaS browser API key is unavailable.");
  corePromise = import("baas-web-sdk/core").then(({ CoreSdk }) => {
    const core = new CoreSdk({ apiKey });
    void core.initializeApp().catch(() => console.warn("BaaS installation could not be initialized."));
    return core;
  });
  return corePromise;
}

export async function initializeBaasAuth() {
  authPromise ??= Promise.all([import("baas-web-sdk/auth"), initializeBaasCore()]).then(([{ AuthSdk }, core]) => {
    new AuthSdk(core as unknown as ConstructorParameters<typeof AuthSdk>[0]);
  }).catch(() => {
    console.warn("BaaS Auth could not be initialized.");
  });
  return authPromise;
}

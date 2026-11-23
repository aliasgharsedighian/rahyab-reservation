import type { CoreSdk } from "baas-web-sdk/core";
import { readBaasInstallationId, rememberBaasInstallation } from "./baas-installation";

let corePromise: Promise<CoreSdk> | undefined;
let coreStartup: Promise<void> | undefined;
let authPromise: Promise<void> | undefined;

export function initializeBaasCore() {
  if (typeof window === "undefined") throw new Error("BaaS requires a browser.");
  if (corePromise) return corePromise;
  const apiKey = process.env.NEXT_PUBLIC_BAAS_API_KEY;
  if (!apiKey) throw new Error("BaaS browser API key is unavailable.");
  corePromise = import("baas-web-sdk/core").then(({ CoreSdk }) => {
    class CoreWithInstallationId extends CoreSdk {
      override async deviceRegister(...args: Parameters<CoreSdk["deviceRegister"]>) {
        const response = await super.deviceRegister(...args);
        if (response.success) await rememberBaasInstallation(response.data);
        return response;
      }

      override async refreshInstallationToken() {
        const response = await super.refreshInstallationToken();
        if (response.success) await rememberBaasInstallation(response.data);
        return response;
      }
    }

    const core = new CoreWithInstallationId({ apiKey });
    coreStartup = core.initializeApp()
      .catch(() => console.warn("BaaS installation could not be initialized."))
      .finally(() => { coreStartup = undefined; });
    return core;
  });
  return corePromise;
}

export async function getBaasInstallationId() {
  const core = await initializeBaasCore();
  await coreStartup;
  const token = await core.ensureInstallationToken();
  const id = await readBaasInstallationId(token);
  if (id) return id;

  // Existing SDK installations may have a token but no cached installation ID yet.
  await core.refreshInstallationToken();
  return readBaasInstallationId(await core.ensureInstallationToken());
}

export async function initializeBaasAuth() {
  authPromise ??= Promise.all([import("baas-web-sdk/auth"), initializeBaasCore()]).then(([{ AuthSdk }, core]) => {
    new AuthSdk(core as unknown as ConstructorParameters<typeof AuthSdk>[0]);
  }).catch(() => {
    console.warn("BaaS Auth could not be initialized.");
  });
  return authPromise;
}

export interface BaasCore {
  readonly SDK_VERSION: string;
  initializeApp(): Promise<void>;
}

declare global {
  interface Window {
    CoreSDK?: new (config: { apiKey: string }) => BaasCore;
    AuthSDK?: new (core: BaasCore) => object;
  }
}

let core: BaasCore | undefined;
let auth: object | undefined;

export function initializeBaasCore() {
  if (core) return core;

  const apiKey = process.env.NEXT_PUBLIC_BAAS_API_KEY;
  if (!apiKey || !window.CoreSDK) throw new Error("BaaS Core SDK is unavailable.");

  core = new window.CoreSDK({ apiKey });
  // The modules can retry installation through Core if the initial attempt fails.
  void core.initializeApp().catch(() => console.warn("BaaS installation could not be initialized."));
  return core;
}

export function initializeBaasAuth() {
  if (auth || !window.AuthSDK) return;
  try {
    auth = new window.AuthSDK(initializeBaasCore());
  } catch {
    console.warn("BaaS Auth could not be initialized.");
  }
}

type ProductView = {
  product_id: string;
  category: "food";
  in_stock: true;
  price: number;
};

interface AnalyticsClient {
  logEvent(name: "product_view", parameters: ProductView): Promise<unknown>;
}

interface CoreClient {
  readonly SDK_VERSION: string;
}

declare global {
  interface Window {
    CoreSDK?: new (config: { apiKey: string }) => CoreClient;
    AnalyticsSDK?: new (core: CoreClient, config: { appVersion: string }) => AnalyticsClient;
  }
}

let analytics: AnalyticsClient | undefined;
let unavailable = false;
const pendingViews: ProductView[] = [];

export function disableAnalytics() {
  unavailable = true;
  pendingViews.length = 0;
}

async function sendProductView(parameters: ProductView) {
  try {
    await analytics?.logEvent("product_view", parameters);
  } catch {
    // Analytics failures must not interrupt reservations.
    console.warn("Analytics product_view could not be recorded.");
  }
}

export function initializeAnalytics() {
  if (analytics || unavailable || typeof window === "undefined") return;

  const apiKey = process.env.NEXT_PUBLIC_BAAS_API_KEY;
  if (!apiKey || !window.CoreSDK || !window.AnalyticsSDK) {
    disableAnalytics();
    return;
  }

  try {
    const core = new window.CoreSDK({ apiKey });
    analytics = new window.AnalyticsSDK(core, { appVersion: "1.0.0" });
    for (const parameters of pendingViews.splice(0)) {
      void sendProductView(parameters);
    }
  } catch {
    disableAnalytics();
    console.warn("Analytics could not be initialized.");
  }
}

export function logFoodProductView(foodId: number, price: number) {
  if (typeof window === "undefined" || unavailable || !process.env.NEXT_PUBLIC_BAAS_API_KEY) return;

  const parameters: ProductView = {
    product_id: `P-${foodId}`,
    category: "food",
    in_stock: true,
    price,
  };

  if (analytics) {
    void sendProductView(parameters);
  } else {
    // Preserve views made before the SDK finishes loading, with a bounded queue.
    if (pendingViews.length >= 100) pendingViews.shift();
    pendingViews.push(parameters);
  }
}

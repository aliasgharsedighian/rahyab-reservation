interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallState {
  platform: "unknown" | "ios" | "android" | "desktop";
  standalone: boolean;
  installed: boolean;
  safari: boolean;
  canInstall: boolean;
}

const initialState: InstallState = { platform: "unknown", standalone: false, installed: false, safari: false, canInstall: false };

let state: InstallState = initialState;
let prompt: InstallPromptEvent | undefined;
const listeners = new Set<() => void>();

export const getInstallState = () => state;
export const getInitialInstallState = () => initialState;
export function subscribeToInstall(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function updateState(next: Partial<InstallState>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

export function observePwaInstall() {
  const standalone = window.matchMedia("(display-mode: standalone)");
  const agent = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/i.test(agent) || (/Macintosh/i.test(agent) && navigator.maxTouchPoints > 1);
  const platform = ios ? "ios" : /Android/i.test(agent) ? "android" : "desktop";
  const safari = /Safari/i.test(agent) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(agent);
  const syncMode = () => updateState({
    platform,
    safari,
    standalone: standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true,
  });
  const capturePrompt = (event: Event) => {
    if (platform !== "android") return;
    event.preventDefault();
    prompt = event as InstallPromptEvent;
    updateState({ canInstall: true, installed: false });
  };
  const installed = () => {
    prompt = undefined;
    updateState({ installed: true, canInstall: false });
  };

  window.addEventListener("beforeinstallprompt", capturePrompt);
  window.addEventListener("appinstalled", installed);
  window.addEventListener("pageshow", syncMode);
  standalone.addEventListener("change", syncMode);
  syncMode();
  return () => {
    window.removeEventListener("beforeinstallprompt", capturePrompt);
    window.removeEventListener("appinstalled", installed);
    window.removeEventListener("pageshow", syncMode);
    standalone.removeEventListener("change", syncMode);
  };
}

export async function promptPwaInstall() {
  const event = prompt;
  if (!event) return false;
  prompt = undefined;
  updateState({ canInstall: false });
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome === "accepted") updateState({ installed: true });
  return outcome === "accepted";
}

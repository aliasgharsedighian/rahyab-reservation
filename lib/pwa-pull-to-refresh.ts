const PULL_THRESHOLD = 72;
const MAX_PULL = 104;
const EDGE_GUTTER = 24;

const INTERACTIVE = [
  "a", "button", "input", "textarea", "select", "label", "video", "audio",
  '[contenteditable]:not([contenteditable="false"])', '[role="button"]',
  '[role="slider"]', '[role="switch"]', '[role="tab"]', '[role="combobox"]',
  '[data-slot="carousel"]', '[data-slot="slider"]', '[data-slot="scroll-area"]',
  "[data-vaul-drawer]", "[data-pull-to-refresh-ignore]", ".rmdp-wrapper",
].join(",");

const OVERLAYS = [
  "dialog[open]", '[role="dialog"]:not([data-state="closed"])',
  '[role="alertdialog"]:not([data-state="closed"])',
  ...["drawer", "sheet", "popover", "select", "dropdown-menu", "menubar"].map(
    (slot) => `[data-slot="${slot}-content"][data-state="open"]`,
  ),
].join(",");

function atTop() {
  return window.scrollY <= 1 && (document.scrollingElement?.scrollTop ?? 0) <= 1;
}

function isBlocked() {
  return !navigator.onLine || document.visibilityState !== "visible" ||
    document.body.hasAttribute("data-scroll-locked") ||
    /hidden|clip/.test(getComputedStyle(document.body).overflowY) ||
    getComputedStyle(document.body).position === "fixed" ||
    !!document.activeElement?.matches('input, textarea, select, [contenteditable="true"]') ||
    Array.from(document.querySelectorAll<HTMLElement>(OVERLAYS)).some(
      (element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden",
    );
}

function canStart(target: EventTarget | null, root: HTMLElement) {
  if (!(target instanceof Element) || !root.contains(target) || target.closest(INTERACTIVE)) return false;

  // Independent scrolling surfaces retain their gestures, even at their own top.
  for (let element: Element | null = target; element && element !== document.body; element = element.parentElement) {
    const style = getComputedStyle(element);
    if (style.position === "fixed" || style.touchAction === "none" ||
      (/auto|scroll/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1) ||
      (/auto|scroll/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1)) return false;
  }
  return true;
}

/** Installs nothing in browser tabs or desktop PWAs. No user-agent sniffing. */
export function installPwaPullToRefresh(
  root: HTMLElement,
  { onProgress, onRefresh, isRefreshing }: {
    onProgress: (distance: number) => void;
    onRefresh: () => void;
    isRefreshing: () => boolean;
  },
) {
  const standalone = window.matchMedia("(display-mode: standalone)");
  const touch = window.matchMedia("(any-pointer: coarse)");
  let detach: (() => void) | undefined;

  function syncMode() {
    detach?.();
    detach = undefined;
    const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!(standalone.matches || iosStandalone) || !touch.matches) return;

    let gesture: { x: number; y: number; id: number; distance: number; claimed: boolean } | null = null;
    const reset = () => {
      gesture = null;
      root.removeEventListener("touchmove", move);
      onProgress(0);
    };
    const start = (event: TouchEvent) => {
      reset();
      if (event.defaultPrevented || isRefreshing() || event.touches.length !== 1 ||
        !atTop() || isBlocked() || !canStart(event.target, root)) return;
      const finger = event.touches[0];
      // Preserve OS/browser edge navigation.
      if (finger.clientX < EDGE_GUTTER || finger.clientX > window.innerWidth - EDGE_GUTTER) return;
      gesture = { x: finger.clientX, y: finger.clientY, id: finger.identifier, distance: 0, claimed: false };
      // Only an eligible gesture temporarily needs a non-passive move listener.
      root.addEventListener("touchmove", move, { passive: false });
    };
    const move = (event: TouchEvent) => {
      if (!gesture) return;
      const finger = event.touches[0];
      if (event.defaultPrevented || !event.cancelable || event.touches.length !== 1 ||
        finger.identifier !== gesture.id || !atTop() || isBlocked() || isRefreshing()) {
        reset();
        return;
      }
      const dx = Math.abs(finger.clientX - gesture.x);
      const dy = finger.clientY - gesture.y;
      if (dy < 0 || (!gesture.claimed && dx > 6 && dx >= dy)) {
        reset();
        return;
      }
      if (!gesture.claimed && dy < 6) return;
      if (!gesture.claimed && dy <= dx * 1.5) {
        reset();
        return;
      }
      gesture.claimed = true;
      event.preventDefault();
      gesture.distance = Math.min(MAX_PULL, Math.max(0, dy * 0.45));
      onProgress(gesture.distance);
    };
    const end = () => {
      const shouldRefresh = gesture && gesture.distance >= PULL_THRESHOLD &&
        atTop() && !isBlocked() && !isRefreshing();
      reset();
      if (shouldRefresh) onRefresh();
    };
    const visibility = () => { if (document.visibilityState !== "visible") reset(); };

    // Scope native overscroll suppression to the installed touch PWA only.
    const previousOverscroll = document.documentElement.style.overscrollBehaviorY;
    document.documentElement.style.overscrollBehaviorY = "none";
    root.addEventListener("touchstart", start, { passive: true });
    root.addEventListener("touchend", end, { passive: true });
    root.addEventListener("touchcancel", reset, { passive: true });
    window.addEventListener("blur", reset);
    window.addEventListener("pagehide", reset);
    document.addEventListener("visibilitychange", visibility);
    detach = () => {
      reset();
      document.documentElement.style.overscrollBehaviorY = previousOverscroll;
      root.removeEventListener("touchstart", start);
      root.removeEventListener("touchend", end);
      root.removeEventListener("touchcancel", reset);
      window.removeEventListener("blur", reset);
      window.removeEventListener("pagehide", reset);
      document.removeEventListener("visibilitychange", visibility);
    };
  }

  syncMode();
  standalone.addEventListener("change", syncMode);
  touch.addEventListener("change", syncMode);
  return () => {
    detach?.();
    standalone.removeEventListener("change", syncMode);
    touch.removeEventListener("change", syncMode);
  };
}

export { PULL_THRESHOLD };

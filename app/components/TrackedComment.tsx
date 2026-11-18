"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { logFeedbackEvent } from "@/lib/analytics";
import { getAnalyticsIdentity } from "@/lib/auth-analytics";

export function useCommentVisit(open: boolean, foodId: number | null) {
  // Keep the same registry across rerenders and desktop/mobile layout changes.
  return useMemo(() => ({ open, foodId, seen: new Set<string>() }), [open, foodId]);
}

export default function TrackedComment({ children, className, foodId, orderId, rating, viewKey, visit, enabled = true }: {
  children: ReactNode;
  className?: string;
  foodId: number;
  orderId?: number;
  rating: number | string | null;
  viewKey: string;
  visit: ReturnType<typeof useCommentVisit>;
  enabled?: boolean;
}) {
  const element = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = element.current;
    if (!enabled || !visit.open || visit.foodId !== foodId || !node || visit.seen.has(viewKey) || !("IntersectionObserver" in window)) return;
    let visible = false;
    const record = () => {
      if (!visible || document.visibilityState !== "visible" || visit.seen.has(viewKey)) return;
      visit.seen.add(viewKey);
      logFeedbackEvent("comment_viewed", {
        foodId, orderId, rating: Number(rating), identity: getAnalyticsIdentity(null),
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      record();
    });
    observer.observe(node);
    document.addEventListener("visibilitychange", record);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", record);
    };
  }, [enabled, foodId, orderId, rating, viewKey, visit]);

  return <article ref={element} className={className}>{children}</article>;
}

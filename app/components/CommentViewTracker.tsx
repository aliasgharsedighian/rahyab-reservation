"use client";

import { useEffect, useMemo } from "react";
import { logFeedbackEvent } from "@/lib/analytics";
import { getAnalyticsIdentity } from "@/lib/auth-analytics";

export function useCommentVisit(open: boolean, foodId: number | null, selectionId: number | null = null) {
  return useMemo(() => ({ open, foodId, selectionId, seen: new Set<string>() }), [open, foodId, selectionId]);
}

export default function CommentViewTracker({ foodId, orderId, rating, visit, enabled }: {
  foodId: number;
  orderId?: number;
  rating?: number | null;
  visit: ReturnType<typeof useCommentVisit>;
  enabled: boolean;
}) {
  useEffect(() => {
    if (!enabled || !visit.open || visit.foodId !== foodId || visit.seen.has("opened")) return;
    const record = () => {
      if (document.visibilityState !== "visible" || visit.seen.has("opened")) return;
      visit.seen.add("opened");
      logFeedbackEvent("comment_viewed", {
        foodId, orderId, rating: rating ?? undefined, identity: getAnalyticsIdentity(null),
      });
    };
    record();
    document.addEventListener("visibilitychange", record);
    return () => document.removeEventListener("visibilitychange", record);
  }, [enabled, foodId, orderId, rating, visit]);

  return null;
}

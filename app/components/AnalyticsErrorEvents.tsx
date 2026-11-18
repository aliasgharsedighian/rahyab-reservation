"use client";

import { useEffect } from "react";
import { logErrorOccurrence } from "@/lib/analytics";
import type { ErrorOccurrence } from "@/lib/analytics-errors";

export default function AnalyticsErrorEvents({ events }: { events: ErrorOccurrence[] }) {
  useEffect(() => {
    for (const event of events) logErrorOccurrence(event);
  }, [events]);

  return null;
}

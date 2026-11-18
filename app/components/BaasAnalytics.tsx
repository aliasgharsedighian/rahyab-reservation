"use client";

import { useEffect } from "react";
import { initializeAnalytics } from "@/lib/analytics";
import { initializeBaasAuth } from "@/lib/baas-core";
import { initializePushSdk } from "@/lib/baas-push";

export default function BaasAnalytics() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BAAS_API_KEY) return;
    void initializeAnalytics();
    void initializeBaasAuth();
    void initializePushSdk();
  }, []);

  return null;
}

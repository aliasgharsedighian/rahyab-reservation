"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initializeAnalytics } from "@/lib/analytics";
import { syncAuthAnalyticsIdentity } from "@/lib/auth-analytics";
import { initializeBaasAuth } from "@/lib/baas-core";
import { initializePushSdk } from "@/lib/baas-push";
import { useAppSelector } from "@/redux/store";

export default function BaasAnalytics() {
  const pathname = usePathname();
  const profileUserId = useAppSelector((state) => state.authReducer.value.profileUserId);
  const inDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const userId = inDashboard ? profileUserId : null;

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BAAS_API_KEY) return;
    void initializeAnalytics();
    void initializeBaasAuth();
    void initializePushSdk();
  }, []);

  useEffect(() => {
    if (userId !== undefined) void syncAuthAnalyticsIdentity(userId);
  }, [userId]);

  return null;
}

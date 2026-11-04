"use client";

import { useState } from "react";
import Script from "next/script";
import { disableAnalytics, initializeAnalytics } from "@/lib/analytics";

export default function BaasAnalytics() {
  const [coreReady, setCoreReady] = useState(false);

  if (!process.env.NEXT_PUBLIC_BAAS_API_KEY) return null;

  return (
    <>
      <Script
        id="baas-core"
        src="https://nexus.baas.gov.ir/repository/SDK_Raw/web/cdn/latest/core.min.js"
        strategy="afterInteractive"
        onReady={() => setCoreReady(true)}
        onError={disableAnalytics}
      />
      {coreReady ? (
        <Script
          id="baas-analytics"
          src="https://nexus.baas.gov.ir/repository/SDK_Raw/web/cdn/latest/analytics.min.js"
          strategy="afterInteractive"
          onReady={initializeAnalytics}
          onError={disableAnalytics}
        />
      ) : null}
    </>
  );
}

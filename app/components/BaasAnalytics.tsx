"use client";

import { useState } from "react";
import Script from "next/script";
import { disableAnalytics, initializeAnalytics } from "@/lib/analytics";
import { initializeBaasAuth, initializeBaasCore } from "@/lib/baas-core";
import { disablePushSdk, initializePushSdk } from "@/lib/baas-push";

const sdkBase = "https://nexus.baas.gov.ir/repository/SDK_Raw/web/cdn/latest";

export default function BaasAnalytics() {
  const [coreReady, setCoreReady] = useState(false);

  if (!process.env.NEXT_PUBLIC_BAAS_API_KEY) return null;

  function handleCoreError() {
    disableAnalytics();
    disablePushSdk();
  }

  function handleCoreReady() {
    try {
      initializeBaasCore();
      setCoreReady(true);
    } catch {
      handleCoreError();
    }
  }

  return (
    <>
      <Script
        id="baas-core"
        src={`${sdkBase}/core.min.js`}
        strategy="afterInteractive"
        onReady={handleCoreReady}
        onError={handleCoreError}
      />
      {coreReady ? (
        <>
          <Script id="baas-analytics" src={`${sdkBase}/analytics.min.js`} strategy="afterInteractive"
            onReady={initializeAnalytics} onError={disableAnalytics} />
          <Script id="baas-auth" src={`${sdkBase}/auth.min.js`} strategy="afterInteractive"
            onReady={initializeBaasAuth} />
          <Script id="baas-push" src={`${sdkBase}/push.min.js`} strategy="afterInteractive"
            onReady={initializePushSdk} onError={disablePushSdk} />
        </>
      ) : null}
    </>
  );
}

"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { getPushStatus, startBaasPush, subscribeToPush } from "@/lib/baas-push";

const messages = {
  unsupported: "اعلان مرورگر در این محیط در دسترس نیست.",
  unavailable: "راه‌اندازی اعلان مرورگر ممکن نشد. صفحه را دوباره بارگذاری کنید.",
  enabled: "مجوز اعلان مرورگر فعال است.",
  denied: "برای دریافت اعلان، مجوز این سایت را در تنظیمات مرورگر تغییر دهید.",
  failed: "اتصال اعلان مرورگر برقرار نشد.",
} as const;

export default function PushNotificationControl() {
  const status = useSyncExternalStore(subscribeToPush, getPushStatus, () => "loading" as const);
  if (status === "unconfigured") return null;

  const message = status in messages ? messages[status as keyof typeof messages] : null;

  return (
    <div className="flex flex-wrap items-center gap-3 px-2 md:px-6">
      {(status === "ready" || status === "loading" || status === "starting" || status === "failed") && (
        <Button type="button" variant="outline" disabled={status === "loading" || status === "starting"}
          onClick={() => void startBaasPush()}>
          {status === "failed" ? "تلاش دوباره برای اعلان مرورگر" : "فعال‌سازی اعلان مرورگر"}
        </Button>
      )}
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

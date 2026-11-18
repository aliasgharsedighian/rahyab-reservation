"use client";

import { BellOff, BellRing, CircleCheck, LoaderCircle, Settings2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pushPermissionHelp, useNotificationSetup } from "../../context/NotificationSetupContext";

export default function PushNotificationControl() {
  const { pushStatus, openInstallGuide, showPushOffer, installedInBrowser, ios } = useNotificationSetup();
  if (pushStatus === "unconfigured") return null;

  const busy = pushStatus === "loading" || pushStatus === "starting" || pushStatus === "prompting";
  const enabled = pushStatus === "enabled";
  const denied = pushStatus === "denied";
  const needsApp = pushStatus === "install-required";
  const Icon = busy ? LoaderCircle : enabled ? CircleCheck : denied ? BellOff : needsApp ? Smartphone : BellRing;
  const description = {
    "install-required": installedInBrowser
      ? "فودنیکس را از صفحهٔ اصلی گوشی باز کنید و از زنگ بالای صفحه اعلان‌ها را فعال کنید."
      : "برای دریافت اعلان روی گوشی، فودنیکس را به صفحهٔ اصلی اضافه کنید.",
    unsupported: "اعلان در این مرورگر یا دستگاه در دسترس نیست.",
    loading: "در حال بررسی امکان دریافت اعلان…",
    unavailable: "آماده‌سازی اعلان‌ها انجام نشد. صفحه را دوباره بارگذاری کنید.",
    ready: "به‌روزرسانی رزروها و پیام‌های مهم را روی این دستگاه دریافت کنید.",
    prompting: "درخواست مجوز را در مرورگرتان بررسی کنید.",
    starting: "در حال اتصال به سرویس اعلان…",
    enabled: "اعلان‌ها برای این دستگاه فعال‌اند.",
    denied: pushPermissionHelp(ios),
    failed: "اتصال به سرویس اعلان برقرار نشد. می‌توانید دوباره تلاش کنید.",
  }[pushStatus];

  return (
    <section aria-labelledby="push-notification-title" className="flex flex-wrap items-center gap-3 rounded-2xl border border-(--base-green)/20 bg-(--light-green)/35 p-4 sm:gap-4 sm:p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--light-green) text-(--base-green)">
        <Icon className={busy ? "size-5 motion-safe:animate-spin" : "size-5"} aria-hidden="true" />
      </span>
      <div className="min-w-0 basis-40 grow space-y-1">
        <h2 id="push-notification-title" className="text-sm font-bold">اعلان روی این دستگاه</h2>
        <p role="status" className="text-xs leading-6 text-muted-foreground sm:text-sm">{description}</p>
      </div>
      {needsApp && !installedInBrowser && (
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={openInstallGuide}>
          راهنمای نصب فودنیکس
        </Button>
      )}
      {(pushStatus === "ready" || pushStatus === "failed") && (
        <Button type="button" className="w-full sm:w-auto" onClick={showPushOffer}>
          {pushStatus === "failed" ? "تلاش دوباره" : "فعال‌سازی اعلان‌ها"}
        </Button>
      )}
      {denied && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-foreground">
          <Settings2 className="size-3.5" aria-hidden="true" /> مسدود در تنظیمات
        </span>
      )}
    </section>
  );
}

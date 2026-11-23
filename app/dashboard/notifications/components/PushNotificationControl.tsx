"use client";

import { useId } from "react";
import { BellOff, BellRing, LoaderCircle, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { refreshPushInstallation } from "@/lib/push-installation-sync";
import { cn } from "@/lib/utils";
import { pushPermissionHelp, useNotificationSetup } from "../../context/NotificationSetupContext";

export default function PushNotificationControl() {
  const { pushStatus, installation, openInstallGuide, showPushOffer, disablePush, installedInBrowser, ios } = useNotificationSetup();
  const titleId = useId();
  const descriptionId = useId();
  if (pushStatus === "unconfigured") return null;

  const enabled = installation.status === "on";
  const known = enabled || installation.status === "off";
  const canEnable = pushStatus === "ready" || pushStatus === "failed";
  const busy = installation.status === "loading" || installation.changing !== null || pushStatus === "prompting";
  const needsApp = pushStatus === "install-required";
  const Icon = busy ? LoaderCircle : needsApp ? Smartphone : enabled ? BellRing : BellOff;
  const needsPermission = pushStatus === "ready" && Notification.permission === "default";

  let description = enabled ? "به‌روزرسانی رزروها و پیام‌های مهم روی این دستگاه ارسال می‌شوند." : "دریافت اعلان‌های فودنیکس روی این دستگاه خاموش است.";
  if (needsApp) description = installedInBrowser
    ? "برای دریافت اعلان، فودنیکس را از صفحهٔ اصلی گوشی باز کنید."
    : "برای دریافت اعلان روی گوشی، فودنیکس را به صفحهٔ اصلی اضافه کنید.";
  if (pushStatus === "unsupported") description = "دریافت اعلان در این مرورگر یا دستگاه در دسترس نیست.";
  if (pushStatus === "denied") description = pushPermissionHelp(ios);
  if (pushStatus === "unavailable") description = "سرویس اعلان آماده نشد. صفحه را دوباره بارگذاری کنید.";
  if (pushStatus === "loading") description = "در حال آماده‌سازی سرویس اعلان…";
  if (pushStatus === "starting") description = "در حال اتصال به سرویس اعلان…";
  if (enabled && needsPermission) description = "برای دریافت اعلان، دسترسی را در مرورگر تأیید کنید.";
  if (enabled && pushStatus === "failed") description = "اتصال به سرویس اعلان برقرار نشد. دوباره تلاش کنید.";
  if (pushStatus === "prompting") description = "درخواست مجوز را در مرورگر بررسی کنید.";
  if (installation.status === "loading") description = "در حال بررسی وضعیت دریافت اعلان…";
  if (installation.status === "error") description = "وضعیت دریافت اعلان مشخص نشد. دوباره تلاش کنید.";
  if (installation.changing) description = installation.changing === "off" ? "در حال خاموش کردن اعلان‌ها…" : "در حال روشن کردن اعلان‌ها…";

  return (
    <section aria-labelledby={titleId} className={cn(
      "flex flex-wrap items-center gap-3 rounded-2xl border p-4 sm:gap-4 sm:p-5",
      enabled ? "border-(--base-green)/25 bg-(--light-green)/35" : "bg-card",
    )}>
      <span className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-xl",
        enabled ? "bg-(--light-green) text-green-700 dark:text-(--base-green)" : "bg-muted text-muted-foreground",
      )}>
        <Icon className={busy ? "size-5 motion-safe:animate-spin" : "size-5"} aria-hidden="true" />
      </span>
      <div className="min-w-0 basis-40 grow space-y-1">
        <h2 id={titleId} className="text-sm font-bold">اعلان روی این دستگاه</h2>
        <p id={descriptionId} role="status" className="text-xs leading-6 text-muted-foreground sm:text-sm">{description}</p>
      </div>
      {known && (
        <div className="flex shrink-0 items-center gap-2">
          <span className={cn(
            "text-xs font-bold",
            enabled ? "text-green-700 dark:text-(--base-green)" : "text-muted-foreground",
          )} aria-hidden="true">{enabled ? "روشن" : "خاموش"}</span>
          <Switch
            dir="ltr"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            size="lg"
            className="data-[state=checked]:bg-green-700 dark:data-[state=checked]:bg-(--base-green) data-[state=unchecked]:bg-slate-500 dark:data-[state=unchecked]:bg-slate-600 dark:[&_[data-slot=switch-thumb][data-state=checked]]:bg-green-950"
            checked={enabled}
            disabled={busy || (!enabled && !canEnable)}
            onCheckedChange={(checked) => { if (checked) showPushOffer(); else void disablePush(); }}
          />
        </div>
      )}
      {installation.status === "error" && (
        <Button type="button" variant="outline" onClick={() => void refreshPushInstallation(true)}>بررسی دوباره</Button>
      )}
      {needsApp && !installedInBrowser && (
        <Button type="button" variant="outline" onClick={openInstallGuide}>راهنمای نصب فودنیکس</Button>
      )}
      {enabled && !busy && (needsPermission || pushStatus === "failed") && (
        <Button type="button" variant="outline" onClick={showPushOffer}>
          {needsPermission ? "دادن مجوز مرورگر" : "اتصال دوباره"}
        </Button>
      )}
    </section>
  );
}

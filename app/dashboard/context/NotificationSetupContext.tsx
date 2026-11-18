"use client";

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { userInfoAccess } from "@/redux/features/auth-slice";
import { getInitialInstallState, getInstallState, promptPwaInstall, subscribeToInstall } from "@/lib/pwa-install";
import { getPushStatus, requestBaasPushPermission, subscribeToPush } from "@/lib/baas-push";
import PwaInstallGuide from "../components/PwaInstallGuide";

const INSTALL_CHOICE = "foodnix:pwa-install-choice";
const PUSH_CHOICE = "foodnix:push-choice";
const PUSH_TOAST = "foodnix-push-offer";

function readChoice(key: string) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function saveChoice(key: string, choice: string) {
  try { localStorage.setItem(key, choice); } catch { /* Storage may be disabled. */ }
}

function isDialogOpen() {
  return !!document.querySelector(
    '[data-state="open"][data-slot$="-content"][role="alertdialog"], ' +
    '[data-state="open"][data-slot="dialog-content"], [data-state="open"][data-slot="drawer-content"], ' +
    '[data-state="open"][data-slot="sheet-content"], [data-state="open"][data-slot="popover-content"], dialog[open]',
  );
}

export function pushPermissionHelp(ios: boolean) {
  return ios
    ? "در تنظیمات گوشی، به بخش اعلان‌ها بروید، فودنیکس را انتخاب کنید و اجازهٔ اعلان را روشن کنید."
    : "فودنیکس را در مرورگر باز کنید. از کنترل‌های کنار نوار آدرس به مجوزهای سایت بروید و «اعلان‌ها» را مجاز کنید.";
}

interface Setup {
  showInstallLink: boolean;
  openInstallGuide: () => void;
  showPushOffer: () => void;
  pushStatus: ReturnType<typeof getPushStatus>;
  installedInBrowser: boolean;
  ios: boolean;
}

const NotificationSetupContext = createContext<Setup | null>(null);

export function NotificationSetupProvider({ children }: { children: ReactNode }) {
  const { platform, standalone, installed, safari, canInstall } = useSyncExternalStore(
    subscribeToInstall, getInstallState, getInitialInstallState,
  );
  const pushStatus = useSyncExternalStore(subscribeToPush, getPushStatus, () => "loading" as const);
  const { openMobile } = useSidebar();
  const passwordChangeRequired = Number(useSelector(userInfoAccess)?.must_change_password) === 1;
  const [guideOpen, setGuideOpen] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installOffered, setInstallOffered] = useState(false);
  const [pushOffered, setPushOffered] = useState(false);
  const ios = platform === "ios";
  const hasInstallGuide = (ios || platform === "android") && !standalone && !installed;
  const showGuide = guideOpen && hasInstallGuide;

  const closeInstallGuide = useCallback(() => {
    saveChoice(INSTALL_CHOICE, "dismissed");
    setInstallOffered(true);
    setGuideOpen(false);
  }, []);

  const openInstallGuide = useCallback(() => {
    toast.dismiss(PUSH_TOAST);
    setGuideOpen(true);
  }, []);

  const install = async () => {
    setInstalling(true);
    try {
      if (await promptPwaInstall()) {
        saveChoice(INSTALL_CHOICE, "accepted");
        setGuideOpen(false);
        toast.success("برای فعال‌سازی اعلان‌ها، فودنیکس را از صفحهٔ اصلی گوشی باز کنید.", { position: "bottom-center" });
      } else {
        saveChoice(INSTALL_CHOICE, "dismissed");
      }
    } catch {
      toast.error("برای نصب فودنیکس، مراحل نصب دستی را دنبال کنید.");
    } finally {
      setInstalling(false);
    }
  };

  const showOffer = useCallback((automatic = false) => {
    if (showGuide || installing || passwordChangeRequired) return;
    const status = getPushStatus();
    if (status !== "ready" && status !== "failed") return;
    const permission = Notification.permission;
    if (automatic && (permission !== "default" || readChoice(PUSH_CHOICE))) return;

    setPushOffered(true);
    toast.custom((id) => (
      <div dir="rtl" className="flex w-full max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-xl">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--light-green) text-(--base-green)">
          <Bell className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{permission === "granted" ? "اتصال دوبارهٔ اعلان‌ها" : "اعلان‌های فودنیکس را دریافت می‌کنید؟"}</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            {permission === "granted" ? "مجوز داده شده است. برای برقراری دوبارهٔ اتصال تلاش کنید." : "با فعال‌سازی اعلان‌ها، از وضعیت رزروها و اطلاع‌رسانی‌های مهم باخبر شوید."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => {
              toast.dismiss(id);
              void requestBaasPushPermission().then((result) => {
                if (result === "granted") saveChoice(PUSH_CHOICE, "accepted");
                if (result === "denied") {
                  saveChoice(PUSH_CHOICE, "denied");
                  toast.warning(pushPermissionHelp(ios), { position: "bottom-center", icon: <BellOff className="size-4" />, duration: 9000 });
                }
              }).catch(() => toast.error("درخواست مجوز اعلان انجام نشد. دوباره تلاش کنید."));
            }}>{permission === "granted" ? "تلاش دوباره" : "می‌خواهم"}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => {
              saveChoice(PUSH_CHOICE, "dismissed");
              toast.dismiss(id);
            }}>نمی‌خواهم</Button>
          </div>
        </div>
      </div>
    ), { id: PUSH_TOAST, duration: Infinity, position: "bottom-center", dismissible: false });
  }, [showGuide, installing, ios, passwordChangeRequired]);

  const canOfferInstall = hasInstallGuide && !installOffered;
  const canOfferPush = pushStatus === "ready" && !pushOffered;
  useEffect(() => {
    const offerInstall = canOfferInstall && !readChoice(INSTALL_CHOICE);
    const offerPush = canOfferPush && Notification.permission === "default" && !readChoice(PUSH_CHOICE);
    if ((!offerInstall && !offerPush) || showGuide || installing || openMobile || passwordChangeRequired) return;

    let timer: number;
    const offer = () => {
      if (isDialogOpen()) {
        timer = window.setTimeout(offer, 1000);
      } else if (offerInstall && !readChoice(INSTALL_CHOICE)) {
        openInstallGuide();
      } else if (offerPush) {
        showOffer(true);
      }
    };
    const schedule = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === "visible") timer = window.setTimeout(offer, offerInstall ? 10000 : 8000);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [canOfferInstall, canOfferPush, showGuide, installing, openMobile, passwordChangeRequired, openInstallGuide, showOffer]);

  useEffect(() => {
    if (pushStatus !== "ready" && pushStatus !== "failed") toast.dismiss(PUSH_TOAST);
  }, [pushStatus]);

  useEffect(() => () => { toast.dismiss(PUSH_TOAST); }, []);

  return (
    <NotificationSetupContext.Provider value={{
      showInstallLink: hasInstallGuide,
      openInstallGuide,
      showPushOffer: () => showOffer(),
      pushStatus,
      installedInBrowser: installed && !standalone,
      ios,
    }}>
      {children}
      <PwaInstallGuide
        open={showGuide}
        onClose={closeInstallGuide}
        onInstall={install}
        ios={ios}
        safari={safari}
        canInstall={canInstall}
        installing={installing}
      />
    </NotificationSetupContext.Provider>
  );
}

export function useNotificationSetup() {
  const setup = useContext(NotificationSetupContext);
  if (!setup) throw new Error("NotificationSetupProvider is required");
  return setup;
}

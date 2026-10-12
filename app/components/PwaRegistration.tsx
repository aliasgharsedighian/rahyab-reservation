"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { RefreshCwIcon, WifiOffIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

function subscribeToConnection(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export default function PwaRegistration() {
  const isOnline = useSyncExternalStore(subscribeToConnection, () => navigator.onLine, () => true);
  const offlineDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = offlineDialog.current;
    if (!isOnline && !dialog?.open) dialog?.showModal();
    if (isOnline && dialog?.open) dialog.close();
  }, [isOnline]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let registration: ServiceWorkerRegistration | undefined;
    let disposed = false;

    const registerServiceWorker = async () => {
      try {
        const result = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (!disposed) registration = result;
      } catch (error) {
        console.error("PWA registration failed:", error);
      }
    };
    const checkForUpdate = () => {
      if (document.visibilityState === "visible") {
        void registration?.update().catch(() => { /* Retry when the app is opened again. */ });
      }
    };

    if (document.readyState === "complete") void registerServiceWorker();
    else window.addEventListener("load", registerServiceWorker);
    document.addEventListener("visibilitychange", checkForUpdate);
    return () => {
      disposed = true;
      window.removeEventListener("load", registerServiceWorker);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);

  return (
    <dialog ref={offlineDialog} aria-labelledby="offline-title" aria-describedby="offline-description"
      onCancel={(event) => event.preventDefault()}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-3xl border border-(--base-green)/20 bg-background p-6 text-center text-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm sm:p-9">
      <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-(--light-green) text-(--base-green)">
        <WifiOffIcon className="size-10" aria-hidden="true" />
      </div>
      <p className="mt-5 text-xs font-bold text-(--base-green)">فودنیکس همراه شماست</p>
      <h1 id="offline-title" className="iranSansBold mt-2 text-2xl leading-10">اتصال اینترنت قطع شده است</h1>
      <p id="offline-description" className="mt-3 text-sm leading-7 text-(--secondary-text)">
        برای ادامه، اینترنت گوشی یا اتصال Wi-Fi را بررسی کنید. پس از برقراری ارتباط می‌توانید به کارتان ادامه دهید.
      </p>
      <p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm leading-7">
        اگر VPN یا فیلترشکن روشن است، آن را خاموش کنید؛ اتصال به سرور فودنیکس با VPN ممکن نیست.
      </p>
      <Button autoFocus onClick={() => window.location.reload()} className="mt-6 h-12 w-full rounded-xl bg-(--base-green) font-bold text-black hover:bg-(--base-green)/90">
        <RefreshCwIcon aria-hidden="true" /> تلاش دوباره
      </Button>
      <p className="mt-4 text-xs leading-6 text-(--secondary-text)">رزرو غذا به اتصال اینترنت نیاز دارد.</p>
    </dialog>
  );
}

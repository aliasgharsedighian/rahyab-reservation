"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  RefreshCwIcon,
  ServerCrashIcon,
  WifiOffIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

type AppError = Error & { digest?: string };

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: AppError;
  unstable_retry: () => void;
}) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  useEffect(() => {
    const updateConnection = () => setIsOnline(navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);

    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    unstable_retry();
  };

  return (
    <main className="relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      <div aria-hidden="true" className="absolute -right-24 -top-24 size-72 rounded-full bg-(--base-green)/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -left-28 size-80 rounded-full bg-(--base-green)/10 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-(--base-green)/15 bg-card/95 p-6 text-center shadow-[0_24px_70px_rgba(2,193,76,0.10)] backdrop-blur sm:p-9">
        <div className="mx-auto flex size-20 items-center justify-center rounded-3xl border border-(--base-green)/20 bg-(--light-green) text-(--base-green) shadow-sm">
          {isOnline ? <ServerCrashIcon className="size-10" strokeWidth={1.7} /> : <WifiOffIcon className="size-10" strokeWidth={1.7} />}
        </div>

        <p className="mt-5 text-xs font-bold tracking-wide text-(--base-green)">
          {isOnline ? "اختلال موقت در سرویس" : "اتصال اینترنت برقرار نیست"}
        </p>
        <h1 className="iranSansBold mt-2 text-2xl leading-10 sm:text-3xl">مشکلی پیش آمده است</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-(--secondary-text) sm:text-base">
          {isOnline
            ? "در دریافت اطلاعات از سرور مشکلی رخ داد. چند لحظه صبر کنید و دوباره تلاش کنید."
            : "اتصال اینترنت را بررسی کنید؛ پس از برقراری ارتباط دوباره تلاش کنید."}
        </p>

        <div className="mt-7 grid gap-3">
          <Button type="button" size="lg" onClick={handleRetry} disabled={isRetrying || !isOnline} className="h-12 w-full rounded-xl bg-(--base-green) text-base font-bold text-white shadow-[0_10px_24px_rgba(2,193,76,0.22)] hover:bg-(--base-green)/90">
            <RefreshCwIcon className={isRetrying ? "animate-spin" : undefined} aria-hidden="true" />
            {isRetrying ? "در حال اتصال مجدد..." : "تلاش دوباره"}
          </Button>
          <Button type="button" size="lg" variant="ghost" onClick={() => window.location.reload()} className="h-11 w-full rounded-xl text-(--secondary-text)">
            بارگذاری کامل صفحه
            <ArrowRightIcon aria-hidden="true" />
          </Button>
        </div>

        {error.digest ? <p className="mt-6 text-xs text-muted-foreground" dir="ltr">کد پیگیری: {error.digest}</p> : null}
      </section>
    </main>
  );
}

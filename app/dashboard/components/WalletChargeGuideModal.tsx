"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  MessageCircleIcon,
  WalletCardsIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CARD_NUMBER = "5022291324080330";
const DISPLAY_CARD_NUMBER = "5022 2913 2408 0330";
const BALE_PHONE_NUMBER = "09122159062";
const GUIDE_QUERY_KEY = "walletGuide";
export const OPEN_WALLET_CHARGE_GUIDE_EVENT = "open-wallet-charge-guide";

export interface WalletChargeGuideCartDetail {
  source: "cart";
  totalPrice: number;
  walletBalance: number;
}

type CopyTarget = "card" | "phone";

function isCartDetail(value: unknown): value is WalletChargeGuideCartDetail {
  if (!value || typeof value !== "object") {
    return false;
  }

  const detail = value as Partial<WalletChargeGuideCartDetail>;
  return (
    detail.source === "cart" &&
    typeof detail.totalPrice === "number" &&
    Number.isFinite(detail.totalPrice) &&
    typeof detail.walletBalance === "number" &&
    Number.isFinite(detail.walletBalance)
  );
}

function fallbackCopyText(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Copy command failed");
  }
}

export default function WalletChargeGuideModal() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const [cartDetail, setCartDetail] =
    useState<WalletChargeGuideCartDetail | null>(null);
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open =
    manuallyOpened || (searchParams.get(GUIDE_QUERY_KEY) === "1" && !dismissed);
  const totalPrice = cartDetail?.totalPrice ?? 400_000;
  const walletBalance = cartDetail?.walletBalance ?? 200_000;
  const requiredCharge = Math.max(totalPrice - walletBalance, 0);

  useEffect(() => {
    const handleManualOpen = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail : null;
      setCartDetail(isCartDetail(detail) ? detail : null);
      setManuallyOpened(true);
    };
    window.addEventListener(OPEN_WALLET_CHARGE_GUIDE_EVENT, handleManualOpen);

    return () => {
      window.removeEventListener(
        OPEN_WALLET_CHARGE_GUIDE_EVENT,
        handleManualOpen,
      );
      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current);
      }
    };
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setDismissed(true);
      setManuallyOpened(false);
      setCartDetail(null);
      const url = new URL(window.location.href);
      url.searchParams.delete(GUIDE_QUERY_KEY);
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
    }
  };

  const handleCopy = async (value: string, target: CopyTarget) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        fallbackCopyText(value);
      }

      setCopiedTarget(target);
      if (copyResetTimer.current) {
        clearTimeout(copyResetTimer.current);
      }
      copyResetTimer.current = setTimeout(() => setCopiedTarget(null), 2000);
    } catch {
      setCopiedTarget(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border-0 p-0 sm:max-w-lg">
        <div className="bg-linear-to-br from-emerald-600 to-green-500 px-5 py-6 text-white sm:px-6">
          <DialogHeader>
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-white/15">
              <WalletCardsIcon aria-hidden="true" className="size-7" />
            </div>
            <DialogTitle className="text-center text-xl font-bold sm:text-2xl">
              راهنمای شارژ کیف پول
            </DialogTitle>
            <DialogDescription className="text-center leading-6 text-white/90">
              موجودی کیف پول باید حداقل برابر با مبلغ نهایی سفارش شما باشد.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-5 p-4 sm:p-6">
          <section
            aria-labelledby="wallet-example-title"
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/10"
          >
            <h3
              id="wallet-example-title"
              className="mb-3 text-sm font-bold text-amber-900 dark:text-amber-200"
            >
              {cartDetail
                ? "مبلغ موردنیاز برای تکمیل این سبد"
                : "مثال محاسبه مبلغ موردنیاز"}
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/80 p-2 dark:bg-background/50">
                <span className="block text-xs text-muted-foreground">
                  مبلغ سبد
                </span>
                <strong className="mt-1 block text-sm">
                  {totalPrice.toLocaleString("fa-IR")} تومان
                </strong>
              </div>
              <div className="rounded-xl bg-white/80 p-2 dark:bg-background/50">
                <span className="block text-xs text-muted-foreground">
                  موجودی کیف پول
                </span>
                <strong className="mt-1 block text-sm">
                  {walletBalance.toLocaleString("fa-IR")} تومان
                </strong>
              </div>
              <div className="rounded-xl bg-amber-200/70 p-2 dark:bg-amber-400/15">
                <span className="block text-xs text-amber-900 dark:text-amber-200">
                  مبلغ کسری
                </span>
                <strong className="mt-1 block text-sm text-amber-950 dark:text-amber-100">
                  {requiredCharge.toLocaleString("fa-IR")} تومان
                </strong>
              </div>
            </div>
            <p className="mt-3 text-xs leading-6 text-amber-900 dark:text-amber-200">
              {cartDetail ? (
                <>
                  برای نهایی‌کردن این سبد باید{" "}
                  <strong>
                    {requiredCharge.toLocaleString("fa-IR")} تومان
                  </strong>{" "}
                  به کیف پول خود واریز کنید.
                </>
              ) : (
                <>
                  در این مثال، برای نهایی‌کردن سفارش فقط باید مبلغ کسری، یعنی
                  ۲۰۰ هزار تومان، به کیف پول اضافه شود.
                </>
              )}
            </p>
          </section>

          <section
            aria-labelledby="payment-details-title"
            className="space-y-3"
          >
            <h3
              id="payment-details-title"
              className="text-sm font-semibold text-foreground"
            >
              لطفاً مبلغ موردنظر را به شماره کارت زیر واریز کنید:
            </h3>

            <button
              type="button"
              onClick={() => handleCopy(CARD_NUMBER, "card")}
              aria-label="کپی شماره کارت شرکت"
              className="group flex w-full items-center gap-3 rounded-2xl border bg-muted/40 p-4 text-right transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-(--base-green)"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                <CreditCardIcon aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs text-muted-foreground">
                  شماره کارت شرکت
                </span>
                <strong
                  dir="ltr"
                  className="mt-1 block text-left text-base tracking-wider sm:text-lg"
                >
                  {DISPLAY_CARD_NUMBER}
                </strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  به نام: رادمان پرداز ره‌بی
                </span>
              </span>
              <span className="flex w-14 shrink-0 flex-col items-center gap-1 text-xs text-(--base-green)">
                {copiedTarget === "card" ? (
                  <>
                    <CheckIcon aria-hidden="true" className="size-5" />
                    کپی شد
                  </>
                ) : (
                  <>
                    <CopyIcon aria-hidden="true" className="size-5" />
                    کپی
                  </>
                )}
              </span>
            </button>
          </section>

          <section className="rounded-2xl bg-(--light-green) p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--base-green)/15 text-(--base-green)">
                <MessageCircleIcon aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <p className="text-sm leading-7 text-foreground">
                  سپس تصویر رسید واریز را از طریق اپلیکیشن <strong>بله</strong>{" "}
                  به شماره زیر ارسال کنید:
                </p>
                <button
                  type="button"
                  onClick={() => handleCopy(BALE_PHONE_NUMBER, "phone")}
                  aria-label="کپی شماره بله"
                  className="flex w-full items-center justify-between rounded-xl border border-(--base-green)/20 bg-background/80 px-3 py-2.5 transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-(--base-green)"
                >
                  <strong dir="ltr" className="tracking-wider">
                    {BALE_PHONE_NUMBER}
                  </strong>
                  <span className="flex items-center gap-1.5 text-xs text-(--base-green)">
                    {copiedTarget === "phone" ? (
                      <>
                        <CheckIcon aria-hidden="true" className="size-4" />
                        کپی شد
                      </>
                    ) : (
                      <>
                        <CopyIcon aria-hidden="true" className="size-4" />
                        کپی شماره
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </section>

          <p className="text-sm leading-7 text-(--secondary-text)">
            پس از تأیید رسید و شارژ کیف پول، می‌توانید سفارش خود را نهایی کنید.
          </p>

          <p aria-live="polite" className="sr-only">
            {copiedTarget === "card" && "شماره کارت کپی شد."}
            {copiedTarget === "phone" && "شماره بله کپی شد."}
          </p>

          <Button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="h-11 w-full rounded-xl bg-green-500 font-bold text-white hover:bg-green-600 dark:bg-(--base-green)"
          >
            متوجه شدم
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

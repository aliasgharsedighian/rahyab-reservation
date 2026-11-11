"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { CreditCardIcon, MinusIcon, PlusIcon, Wallet2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiClient, UnauthorizedError } from "@/lib/api/client";

const rialsPerToman = 10;
const minimumRials = 10_000;
const minimumTomans = minimumRials / rialsPerToman;
const maximumTomans = Math.floor(Number.MAX_SAFE_INTEGER / rialsPerToman);
const stepTomans = 100_000;
const suggestedTomans = [1_000_000, 2_000_000, 5_000_000];
const formatAmount = new Intl.NumberFormat("fa-IR");
const paymentError = "اتصال به درگاه پرداخت ممکن نشد. دوباره تلاش کنید.";

interface WalletChargeResponse {
  success?: boolean;
  message?: string;
  data?: { payment_url?: string };
}

export default function WalletOnlineCharge() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [amountInput, setAmountInput] = useState("500000");
  const amountTomans = Number(amountInput);
  const amountRials = amountTomans * rialsPerToman;
  const canPay =
    Number.isSafeInteger(amountRials) && amountRials >= minimumRials;

  function updateAmount(digits: string) {
    setAmountInput(digits);
    setError("");
  }

  function handleAmountInput(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const digits = input.value
      .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/[,٬\s]/g, "");
    if (!/^\d*$/.test(digits) || Number(digits) > maximumTomans) return;

    const formatted = digits ? formatAmount.format(Number(digits)) : "";
    if (input.value !== formatted) {
      const remainingDigits =
        input.value
          .slice(input.selectionStart ?? input.value.length)
          .match(/[0-9۰-۹٠-٩]/g)?.length ?? 0;
      const formattedDigits = [...formatted.matchAll(/[۰-۹]/g)];
      const digitBeforeCaret =
        formattedDigits[formattedDigits.length - remainingDigits - 1];
      const caret = digitBeforeCaret ? digitBeforeCaret.index + 1 : 0;

      input.value = formatted;
      input.setSelectionRange(caret, caret);
    }
    updateAmount(digits);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;
    setError("");
    setOpen(nextOpen);
  }

  async function handlePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !canPay) return;
    setIsPending(true);
    setError("");

    try {
      const { data, status } = await apiClient.post<WalletChargeResponse>(
        "online-payments/wallet",
        { amount: amountRials, source: "web" },
        { timeout: 15_000 },
      );

      if (status !== 200 || data?.success !== true) {
        setError(data?.message || paymentError);
      } else {
        const paymentUrl = new URL(data.data?.payment_url ?? "");
        if (paymentUrl.protocol !== "https:")
          throw new Error("Invalid payment URL");

        window.location.assign(paymentUrl.href);
        return;
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      setError(paymentError);
    }

    setIsPending(false);
  }

  const Close = isMobile ? DrawerClose : DialogClose;
  const Title = isMobile ? DrawerTitle : DialogTitle;
  const Description = isMobile ? DrawerDescription : DialogDescription;

  const trigger = (
    <Button
      type="button"
      size="icon"
      aria-label="افزایش اعتبار کیف پول"
      title="افزایش اعتبار کیف پول"
      className="size-11 shrink-0 rounded-full bg-(--base-green) text-white hover:bg-(--base-green)/90 dark:text-zinc-950"
    >
      <PlusIcon className="size-6" aria-hidden="true" />
    </Button>
  );

  const content = (
    <form
      onSubmit={handlePayment}
      className="min-h-0 space-y-5 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6"
    >
      <div className="flex items-center gap-3 text-right">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--light-green) text-(--base-green)">
          <Wallet2Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <Title className="text-lg font-bold">شارژ آنلاین کیف پول</Title>
          <Description className="text-sm leading-6 text-(--secondary-text)">
            برای پرداخت مبلغ شارژ به درگاه بانکی منتقل می‌شوید.
          </Description>
        </div>
      </div>

      <fieldset
        disabled={isPending}
        className="min-w-0 space-y-3 rounded-xl border border-(--base-green)/20 bg-(--light-green) p-4"
      >
        <label
          htmlFor="wallet-charge-amount"
          className="block text-sm font-medium"
        >
          مبلغ شارژ به تومان
        </label>
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10"
            aria-label={`افزایش ${formatAmount.format(stepTomans)} تومان`}
            disabled={amountTomans > maximumTomans - stepTomans}
            onClick={() => updateAmount(String(amountTomans + stepTomans))}
          >
            <PlusIcon aria-hidden="true" />
          </Button>
          <Input
            id="wallet-charge-amount"
            type="text"
            inputMode="numeric"
            dir="ltr"
            value={amountInput ? formatAmount.format(amountTomans) : ""}
            onChange={handleAmountInput}
            aria-describedby="wallet-charge-minimum"
            aria-invalid={amountInput !== "" && !canPay}
            className="bg-background text-center font-bold tabular-nums dark:bg-background"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10"
            aria-label={`کاهش ${formatAmount.format(stepTomans)} تومان`}
            disabled={amountTomans <= minimumTomans}
            onClick={() =>
              updateAmount(
                String(Math.max(minimumTomans, amountTomans - stepTomans)),
              )
            }
          >
            <MinusIcon aria-hidden="true" />
          </Button>
        </div>
        <p
          id="wallet-charge-minimum"
          className="text-xs text-(--secondary-text)"
        >
          حداقل مبلغ {formatAmount.format(minimumTomans)} تومان
        </p>
        <div
          role="group"
          aria-label="مبالغ پیشنهادی به تومان"
          className="grid grid-cols-3 gap-2"
        >
          {suggestedTomans.map((suggestion) => (
            <Button
              key={suggestion}
              type="button"
              size="sm"
              variant="outline"
              aria-pressed={amountTomans === suggestion}
              className="min-w-0 px-1 tabular-nums aria-pressed:border-(--base-green) aria-pressed:text-(--base-green)"
              onClick={() => updateAmount(String(suggestion))}
            >
              {formatAmount.format(suggestion)}
            </Button>
          ))}
        </div>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm leading-6 text-destructive"
        >
          {error}
        </p>
      )}

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={isPending || !canPay}
          className="h-11 w-full bg-(--base-green) text-white hover:bg-(--base-green)/90 dark:text-zinc-950"
        >
          {isPending ? (
            <Spinner aria-label="در حال اتصال به درگاه" />
          ) : (
            <CreditCardIcon aria-hidden="true" />
          )}
          {isPending ? "در حال اتصال به درگاه…" : "ادامه به درگاه پرداخت"}
        </Button>
        <Close asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-11 w-full"
            disabled={isPending}
          >
            انصراف
          </Button>
        </Close>
      </div>
    </form>
  );

  return isMobile ? (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      dismissible={!isPending}
    >
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent
        dir="rtl"
        className="data-[vaul-drawer-direction=bottom]:max-h-[88dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl"
      >
        {content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="flex max-h-[85dvh] flex-col gap-0 rounded-2xl p-0 sm:max-w-md"
      >
        {content}
      </DialogContent>
    </Dialog>
  );
}

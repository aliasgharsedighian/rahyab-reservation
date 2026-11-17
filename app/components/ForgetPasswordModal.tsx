import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { CheckIcon, CopyIcon, ShieldCheckIcon, SmartphoneIcon } from "lucide-react";
import { useRef, useState } from "react";

const BALE_PHONE_NUMBER = "09122159062";

type CopyTarget = "phone";

interface ForgetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOtp: () => void;
  onCloseAutoFocus: (event: Event) => void;
}

export function ForgetPasswordModal({
  open,
  onOpenChange,
  onSelectOtp,
  onCloseAutoFocus,
}: ForgetPasswordModalProps) {
  const [copiedTarget, setCopiedTarget] = useState<CopyTarget | null>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onCloseAutoFocus={onCloseAutoFocus} className="sm:max-w-md rounded-2xl border-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-br from-emerald-600 to-green-500 px-5 py-6 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold md:text-2xl">
              <ShieldCheckIcon className="size-6" />
              فراموشی رمز عبور
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="space-y-5 p-4 md:p-6">
          <div className="space-y-3 rounded-2xl border border-(--base-green)/20 bg-(--light-green) p-4">
            <DialogDescription className="text-sm leading-7 text-foreground">
              اگر به شماره موبایل ثبت‌شده در حسابتان دسترسی دارید، می‌توانید با کدی که برایتان پیامک می‌شود وارد شوید.
            </DialogDescription>
            <Button
              type="button"
              onClick={onSelectOtp}
              className="w-full rounded-xl bg-(--base-green) text-white hover:bg-(--base-green)/90"
            >
              <SmartphoneIcon aria-hidden="true" />
              ورود با کد یکبار مصرف
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold">پشتیبانی در پیام‌رسان بله</h3>
            <p className="text-sm leading-7 text-(--secondary-text)">
              اگر به شماره موبایلتان دسترسی ندارید یا می‌خواهید رمزتان را بازنشانی کنید، به پشتیبانی در بله پیام بدهید.
            </p>
            <button
              type="button"
              onClick={() => handleCopy(BALE_PHONE_NUMBER, "phone")}
              aria-label="کپی شماره پشتیبانی در بله"
              className="flex w-full items-center justify-between rounded-xl border border-(--base-green)/20 bg-background/80 px-3 py-2.5 transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-(--base-green)"
            >
              <span aria-live="polite" className="flex items-center gap-1.5 text-xs text-(--base-green)">
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
              <strong dir="ltr" className="tracking-wider">
                {BALE_PHONE_NUMBER}
              </strong>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

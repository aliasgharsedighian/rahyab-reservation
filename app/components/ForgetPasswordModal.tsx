// components/shared/rules-modal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { CheckIcon, CopyIcon, ShieldCheckIcon } from "lucide-react";
import { useRef, useState } from "react";

const BALE_PHONE_NUMBER = "09122159062";

type CopyTarget = "phone";

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgetPasswordModal({ open, onOpenChange }: RulesModalProps) {
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
      <DialogContent className="sm:max-w-md rounded-2xl border-0 p-0 overflow-hidden">
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
        <div className="p-4 md:p-6">
          <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800 dark:bg-(--light-green) dark:text-emerald-300">
            کاربران گرامی، در صورت فراموش کردن رمز عبور خود، لطفاً به ادمین سایت
            اطلاع دهید تا رمز عبور شما تغییر داده شود.
          </div>

          <button
            type="button"
            onClick={() => handleCopy(BALE_PHONE_NUMBER, "phone")}
            aria-label="کپی شماره بله"
            className="flex w-full items-center justify-between rounded-xl border border-(--base-green)/20 bg-background/80 px-3 py-2.5 transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-(--base-green)"
          >
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
            <strong dir="ltr" className="tracking-wider">
              {BALE_PHONE_NUMBER}
            </strong>
          </button>

          {/* Footer */}
          <div className="mt-6">
            <Button
              className="w-full rounded-xl dark:bg-(--base-green) dark:text-white"
              onClick={() => onOpenChange(false)}
            >
              متوجه شدم
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

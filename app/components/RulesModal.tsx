// components/shared/rules-modal.tsx

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ShieldCheckIcon } from "lucide-react";

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RulesModal({ open, onOpenChange }: RulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-xl rounded-2xl border-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-500 p-3 md:p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-bold flex items-center justify-center gap-2">
              <ShieldCheckIcon className="size-6" />
              قوانین و مقررات
            </DialogTitle>
          </DialogHeader>

          <p className="text-center text-sm text-white/90 mt-3">
            لطفاً پیش از استفاده از سامانه قوانین زیر را مطالعه نمایید.
          </p>
        </div>

        {/* Body */}
        <div className="p-3 md:p-6">
          <div className="text-sm text-gray-600 leading-8 space-y-4 max-h-100 overflow-y-auto pr-1">
            <div className="rounded-xl bg-muted/40 p-4">
              استفاده از سیستم رزرو غذا به منزله پذیرش کامل قوانین و مقررات
              می‌باشد.
            </div>

            <div className="rounded-xl bg-muted/40 p-4">
              کاربران موظف هستند سفارش غذای خود را در بازه زمانی مشخص شده ثبت
              نمایند.
            </div>

            <div className="rounded-xl bg-muted/40 p-4">
              لغو رزرو تنها تا قبل از زمان تعیین شده امکان‌پذیر است.
            </div>

            <div className="rounded-xl bg-muted/40 p-4">
              مسئولیت صحت اطلاعات حساب کاربری بر عهده کاربر می‌باشد.
            </div>

            <div className="rounded-xl bg-muted/40 p-4">
              هرگونه استفاده غیرمجاز از سامانه پیگرد قانونی خواهد داشت.
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogDescription></DialogDescription>
    </Dialog>
  );
}

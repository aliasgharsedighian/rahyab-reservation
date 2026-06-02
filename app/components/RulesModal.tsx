// components/shared/rules-modal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
  ShieldCheckIcon,
  Clock3Icon,
  UtensilsCrossedIcon,
  WalletIcon,
  AlertTriangleIcon,
} from "lucide-react";

interface RulesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const rules = [
  {
    icon: Clock3Icon,
    title: "زمان ثبت سفارش",
    description:
      "ثبت سفارش غذا فقط در روزهای چهارشنبه از ساعت ۸ تا ۱۲ امکان‌پذیر است.",
  },
  {
    icon: UtensilsCrossedIcon,
    title: "رزرو غذا",
    description: "در حال حاضر فقط امکان رزرو غذای هفته آینده وجود دارد.",
  },
  {
    icon: WalletIcon,
    title: "لغو سفارش",
    description:
      "لغو رزرو تا ۲۴ ساعت قبل از زمان تحویل غذا امکان‌پذیر است و مبلغ سفارش به کیف پول شما بازگردانده می‌شود.",
  },
  {
    icon: AlertTriangleIcon,
    title: "عدم استفاده از غذا",
    description:
      "در صورت عدم دریافت یا استفاده از غذای رزرو شده، مسئولیت پیگیری و تعیین وضعیت آن بر عهده شرکت مربوطه خواهد بود.",
  },
  {
    icon: ShieldCheckIcon,
    title: "مسئولیت حساب کاربری",
    description: "مسئولیت صحت اطلاعات حساب کاربری بر عهده کاربر است.",
  },
  {
    icon: AlertTriangleIcon,
    title: "استفاده از سامانه",
    description: "هرگونه استفاده غیرمجاز از سامانه، پیگرد قانونی خواهد داشت.",
  },
];

export function RulesModal({ open, onOpenChange }: RulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-600 to-green-500 px-5 py-6 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl font-bold md:text-2xl">
              <ShieldCheckIcon className="size-6" />
              قوانین و مقررات
            </DialogTitle>
          </DialogHeader>

          <p className="mt-3 text-center text-sm leading-6 text-white/90">
            لطفاً پیش از استفاده از سامانه، قوانین زیر را مطالعه کنید.
          </p>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6">
          <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-800">
            استفاده از سامانه رزرو غذا به منزله پذیرش کامل قوانین و مقررات است.
          </div>

          <div className="max-h-75 lg:max-h-95 space-y-3 overflow-y-auto pr-1">
            {rules.map((rule, index) => {
              const Icon = rule.icon;

              return (
                <div
                  key={index}
                  className="flex gap-3 rounded-2xl border bg-muted/40 p-4 transition-colors hover:bg-muted/60"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Icon className="size-5" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {rule.title}
                    </h4>

                    <p className="text-sm leading-6 text-gray-600">
                      {rule.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6">
            <Button
              className="w-full rounded-xl"
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

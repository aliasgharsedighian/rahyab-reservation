"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Check, Download, EllipsisVertical, RefreshCw, Share, Smartphone, SquarePlus } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onInstall: () => void;
  ios: boolean;
  safari: boolean;
  canInstall: boolean;
  installing: boolean;
}

export default function PwaInstallGuide({ open, onClose, onInstall, ios, safari, canInstall, installing }: Props) {
  const compact = useIsMobile();
  const Title = compact ? DrawerTitle : DialogTitle;
  const Description = compact ? DrawerDescription : DialogDescription;
  const steps = ios
    ? [
        { icon: Share, text: "در Safari روی دکمهٔ اشتراک‌گذاری بزنید.", hint: "Share" },
        { icon: SquarePlus, text: "«افزودن به صفحهٔ اصلی» را انتخاب کنید.", hint: "Add to Home Screen" },
        { icon: Check, text: "اگر گزینهٔ باز کردن به‌صورت برنامه را دیدید، آن را روشن کنید و «افزودن» را بزنید.", hint: "Add" },
      ]
    : [
        { icon: EllipsisVertical, text: "منوی مرورگر را باز کنید.", hint: "⋮" },
        { icon: SquarePlus, text: "«نصب برنامه» یا «افزودن به صفحهٔ اصلی» را انتخاب کنید.", hint: "Install app / Add to Home screen" },
        { icon: Check, text: "نصب فودنیکس را تأیید کنید.", hint: "Install" },
      ];

  const content = (
    <>
      <div className="flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-(--light-green) text-(--base-green)">
            <Smartphone className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <Title className="text-lg font-bold">نصب فودنیکس و فعال‌سازی اعلان‌ها</Title>
            <Description className="text-sm leading-6 text-muted-foreground">
              فودنیکس را به صفحهٔ اصلی گوشی اضافه کنید تا بتوانید اعلان‌های رزرو و پیام‌های مهم را دریافت کنید.
            </Description>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-(--base-green)/20 bg-(--light-green)/60 p-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--light-green) text-(--base-green)">
            <RefreshCw className="size-4" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h3 className="text-sm font-bold">به‌روزرسانی بدون نصب دوباره</h3>
            <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
              نسخهٔ تحت وب را یک‌بار نصب کنید. قابلیت‌ها و بهبودهای تازه از طریق خود فودنیکس در دسترس‌تان قرار می‌گیرند.
            </p>
          </div>
        </div>
        {ios && !safari && (
          <p className="rounded-xl bg-muted px-3 py-2 text-sm leading-6">
            این صفحه را در Safari باز کنید تا گزینهٔ افزودن به صفحهٔ اصلی را ببینید.
          </p>
        )}
        <ol className="space-y-2">
          {steps.map(({ icon: Icon, text, hint }) => (
            <li key={hint} className="flex items-center gap-3 rounded-xl border bg-card p-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm leading-6">{text}</p>
                <p dir="ltr" className="text-right text-xs text-muted-foreground">{hint}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-sm leading-6 text-muted-foreground">
          پس از نصب، فودنیکس را از صفحهٔ اصلی گوشی باز کنید و اعلان‌ها را از زنگ بالای صفحه فعال کنید.
        </p>
      </div>
      <div className="flex shrink-0 gap-2 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {!ios && (canInstall || installing) && (
          <Button type="button" className="flex-1" disabled={installing} onClick={onInstall}>
            <Download aria-hidden="true" /> نصب اپلیکیشن
          </Button>
        )}
        <Button type="button" variant={canInstall || installing ? "outline" : "default"} className="flex-1" onClick={onClose}>
          متوجه شدم
        </Button>
      </div>
    </>
  );

  return compact ? (
    <Drawer open={open} autoFocus onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DrawerContent dir="rtl" className="data-[vaul-drawer-direction=bottom]:max-h-[90dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl">
        {content}
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <DialogContent dir="rtl" showCloseButton={false} className="flex max-h-[88dvh] flex-col gap-0 overflow-hidden p-0 text-right sm:max-w-md">
        {content}
      </DialogContent>
    </Dialog>
  );
}

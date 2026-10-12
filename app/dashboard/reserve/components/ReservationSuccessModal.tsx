"use client";

import Link from "next/link";
import { CalendarDays, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export default function ReservationSuccessModal({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" showCloseButton={false} className="gap-6 rounded-2xl p-6 text-center sm:max-w-md sm:p-8">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-(--base-green) text-white dark:text-zinc-950"><Check className="size-10" strokeWidth={3} /></span>
        <DialogTitle className="text-xl font-bold leading-9">رزرو شما با موفقیت انجام شد.</DialogTitle>
        <DialogDescription className="text-sm leading-8 text-(--secondary-text)">برای مشاهده سفارش خود به صفحه رزروهای پیش رو مراجعه کنید.</DialogDescription>
        <div className="flex flex-col gap-2 min-[360px]:flex-row">
          <Button variant="ghost" className="text-(--base-green)" onClick={() => onOpenChange(false)}>بستن</Button>
          <Button asChild className="h-auto min-h-11 flex-1 whitespace-normal bg-(--base-green) text-white hover:bg-(--base-green)/90 dark:text-zinc-950">
            <Link href="/dashboard/upcoming-reserve?page=1"><CalendarDays className="size-4 shrink-0" />مشاهده رزروهای پیش رو</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

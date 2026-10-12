"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ShoppingCartIcon, XIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { reserveSelectItems } from "@/redux/features/reserveBasketSlice";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import ReserveCartItems from "../reserve/components/ReserveCartItems";

export default function HeaderReserveCart() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const items = useSelector(reserveSelectItems);
  const sortedItems = useMemo(() => [...items].sort((a, b) => a.jalali_date.localeCompare(b.jalali_date)), [items]);
  const totalCount = items.reduce((total, item) => total + item.count, 0);
  const totalPrice = items.reduce((total, item) => total + item.price * item.count, 0);
  const Title = isMobile ? DrawerTitle : DialogTitle;
  const Description = isMobile ? DrawerDescription : DialogDescription;
  const Close = isMobile ? DrawerClose : DialogClose;

  const trigger = (
    <Button variant="ghost" size="icon" className="relative shrink-0" aria-label={"مشاهده سبد رزرو، " + totalCount.toLocaleString("fa-IR") + " عدد"}>
      <ShoppingCartIcon className="size-5 text-(--base-green)" aria-hidden="true" />
      {totalCount > 0 ? <span aria-hidden="true" className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-(--base-green) px-1 text-[10px] leading-4 text-white">{totalCount > 99 ? "۹۹+" : totalCount.toLocaleString("fa-IR")}</span> : null}
    </Button>
  );
  const content = (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <Title className="flex items-center gap-2 text-base font-bold"><ShoppingCartIcon className="size-5 text-(--base-green)" aria-hidden="true" />سبد رزرو شما</Title>
        <Close asChild><Button variant="ghost" size="icon" aria-label="بستن سبد رزرو"><XIcon className="size-5" /></Button></Close>
      </div>
      <Description className="sr-only">غذاهای انتخاب‌شده و جمع مبلغ سبد رزرو؛ برای نهایی کردن به صفحه رزرو بروید.</Description>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" tabIndex={0} aria-label="غذاهای انتخاب‌شده">
        {items.length ? <ReserveCartItems items={sortedItems} /> : <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 text-sm text-(--secondary-text)"><ShoppingCartIcon className="size-10 text-(--base-green)" aria-hidden="true" />سبد رزرو شما خالی است.</div>}
      </div>
      <div className="shrink-0 space-y-3 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between text-sm"><span>تعداد کل</span><span>{totalCount.toLocaleString("fa-IR")} عدد</span></div>
        <div className="flex items-center justify-between text-sm"><span>مبلغ کل</span><strong>{totalPrice.toLocaleString("fa-IR")} تومان</strong></div>
        <Button asChild className="min-h-10 w-full dark:bg-(--base-green) dark:text-white"><Link href="/dashboard/reserve" onClick={() => setOpen(false)}>{items.length ? "ادامه رزرو و پرداخت" : "انتخاب غذا"}</Link></Button>
      </div>
    </>
  );

  if (isMobile) return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent dir="rtl" className="data-[vaul-drawer-direction=bottom]:h-[85dvh] data-[vaul-drawer-direction=bottom]:max-h-[85dvh]">{content}</DrawerContent>
    </Drawer>
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent dir="rtl" showCloseButton={false} className="flex h-[min(40rem,85dvh)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">{content}</DialogContent>
    </Dialog>
  );
}

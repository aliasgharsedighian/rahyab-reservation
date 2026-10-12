"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ShoppingBasketIcon,
  WalletCardsIcon,
  XIcon,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DirectionProvider } from "@/components/ui/direction";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ReserveCartItem } from "../types";
import ReserveCartItems from "./ReserveCartItems";

interface FoodReserveCardMobileProps {
  reserveCart: ReserveCartItem[];
  sortedReserveCart: ReserveCartItem[];
  totalPrice: number;
  totalCount: number;
  sendDataToApi: () => Promise<void>;
  walletBalance: number | null;
}

function FoodReserveCardMobile({
  reserveCart,
  sortedReserveCart,
  totalPrice,
  totalCount,
  sendDataToApi,
  walletBalance,
}: FoodReserveCardMobileProps) {
  if (reserveCart.length === 0) return;
  return (
    <div className="fixed inset-x-2 bottom-2 z-20 flex flex-col gap-3 rounded-2xl border border-(--base-green)/40 bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-foreground shadow-2xl">
      <Drawer>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="flex flex-wrap items-center gap-1.5 text-(--secondary-text)"><WalletCardsIcon className="size-4 text-(--base-green)" aria-hidden="true" />موجودی کیف پول <strong className="text-foreground">{walletBalance === null ? "نامشخص" : walletBalance.toLocaleString("fa-IR") + " تومان"}</strong></span>
          <DrawerTrigger className="flex items-center gap-1 py-1 text-(--base-green)">مشاهده سبد ({totalCount.toLocaleString("fa-IR")})<ChevronUp className="size-4" /></DrawerTrigger>
        </div>
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:h-[92dvh] data-[vaul-drawer-direction=bottom]:max-h-[92dvh]">
          <DrawerDescription className="sr-only">
            جزئیات غذاهای انتخاب‌شده، موجودی کیف پول و مبلغ کل رزرو
          </DrawerDescription>
          <DrawerHeader className="flex-row items-center justify-between border-b px-4 py-2 text-right">
            <DrawerTitle className="font-bold">سبد رزرو شما</DrawerTitle>
            <DrawerClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="بستن سبد رزرو"
              >
                <XIcon className="size-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <DirectionProvider dir="rtl">
            <ScrollArea className="min-h-0 flex-1 overflow-auto">
              <div
                className={`min-h-48 flex flex-col gap-3 p-3 ${reserveCart.length !== 0 ? "justify-start" : "justify-center"}`}
              >
                {reserveCart.length !== 0 ? (
                  <ReserveCartItems items={sortedReserveCart} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ShoppingBasketIcon className="size-12 text-(--base-green)" />
                    <p className="text-(--secondary-text)">سبد شما خالی است</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DirectionProvider>
          <DrawerFooter className="shrink-0 border-t">
            {" "}
            {reserveCart.length !== 0 ? (
              <div className="w-full flex flex-col gap-4 px-3">
                <div className="">
                  <div className="flex items-center justify-between rounded-xl bg-(--light-green) p-3">
                    <span className="flex items-center gap-2 text-sm text-(--secondary-text)">
                      <WalletCardsIcon
                        aria-hidden="true"
                        className="size-5 text-(--base-green)"
                      />
                      موجودی کیف پول
                    </span>
                    <strong className="text-sm text-foreground">
                      {walletBalance === null
                        ? "نامشخص"
                        : `${walletBalance.toLocaleString()} تومان`}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <p className="">مبلغ کل</p>
                    <span className="flex items-center gap-7 text-sm md:text-base">
                      {totalPrice.toLocaleString()}

                      {"تومان"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <p className="text-[12px]">تعداد کل</p>
                    <span className="flex items-center gap-7 text-sm">
                      {totalCount} عدد
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full dark:bg-(--base-green) dark:text-white"
                  size="lg"
                  onClick={sendDataToApi}
                >
                  ثبت و نهایی کردن رزرو
                </Button>
              </div>
            ) : null}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="flex items-center justify-between text-sm"><span>مبلغ کل</span><strong>{totalPrice.toLocaleString("fa-IR")} تومان</strong></div>
      <Button className="min-h-12 w-full dark:bg-(--base-green) dark:text-white" size="lg" onClick={sendDataToApi}>ثبت و نهایی کردن رزرو</Button>
    </div>
  );
}

export default FoodReserveCardMobile;

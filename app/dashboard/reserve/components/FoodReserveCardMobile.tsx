"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronUp,
  ShoppingBasketIcon,
  WalletCardsIcon,
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
    <div className="flex flex-col bg-background text-foreground fixed bottom-0 w-full right-0 h-30 z-20 shadow-2xl border-t border-border pt-6">
      <Drawer>
        <DrawerTrigger>
          {" "}
          <div className="flex items-center gap-2 w-full justify-center absolute h-16.5 -top-3.5">
            <p className="text-[12px] text-(--base-green)">مشاهده سبد</p>
            <ChevronUp className="size-5" />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerDescription className="sr-only">
            جزئیات غذاهای انتخاب‌شده، موجودی کیف پول و مبلغ کل رزرو
          </DrawerDescription>
          <DrawerHeader>
            <DrawerTitle className="sr-only">سبد رزرو شما</DrawerTitle>
            <DrawerClose>بستن</DrawerClose>
          </DrawerHeader>

          <DirectionProvider dir="rtl">
            <ScrollArea className="h-auto max-h-[75vh] overflow-auto">
              <div
                className={`min-h-48 flex flex-col gap-3 p-3 ${reserveCart.length !== 0 ? "justify-start" : "justify-center"}`}
              >
                {reserveCart.length !== 0 ? (
                  <ReserveCartItems items={sortedReserveCart} /> /*
                  sortedReserveCart.map((item) => (
                    <div
                      key={item.id}
                      className="text-sm lg:text-base flex items-start justify-between border-b pb-2 last:border-none"
                    >
                      <div className="flex items-center gap-2">
                        <div className="bg-(--light-green) p-2 rounded-full">
                          <ForkKnife className="text-(--base-green)" />
                        </div>
                        <div className="flex flex-col gap-1 items-start text-sm">
                          <p>{item.name}</p>
                          <span>
                            {item.day} {item.jalali_date}
                          </span>
                          <span>{item.count} عدد</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1 text-sm text-red-400"
                        onClick={() =>
                          dispatch(removeFromReserveBasket({ id: item.id }))
                        }
                      >
                        <Trash2Icon className="text-red-400 size-4" />
                        <span>حذف</span>
                      </Button>
                    </div>
                  )) */
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <ShoppingBasketIcon className="size-12 text-(--base-green)" />
                    <p className="text-(--secondary-text)">سبد شما خالی است</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DirectionProvider>
          <DrawerFooter className="border-t">
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
                  {/* <div className="flex items-center justify-between pt-3">
              <p className="">جمع تعداد</p>
              <span className="flex items-center gap-7 text-sm md:text-base">
                {1} {"پرس"}
              </span>
            </div> */}
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

      <div className="w-full flex flex-col gap-1 px-3">
        <div className="">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-(--secondary-text)">
              <WalletCardsIcon
                aria-hidden="true"
                className="size-4 text-(--base-green)"
              />
              موجودی کیف پول
            </span>
            <strong>
              {walletBalance === null
                ? "نامشخص"
                : `${walletBalance.toLocaleString()} تومان`}
            </strong>
          </div>
          {/* <div className="flex items-center justify-between pt-3">
              <p className="">جمع تعداد</p>
              <span className="flex items-center gap-7 text-sm md:text-base">
                {1} {"پرس"}
              </span>
            </div> */}
          <div className="flex items-center justify-between pt-3">
            <p className="">مبلغ کل</p>
            <span className="flex items-center gap-7 text-sm md:text-base">
              {totalPrice.toLocaleString()}

              {"تومان"}
            </span>
          </div>
          {/* <div className="flex items-center justify-between pt-3">
            <p className="text-[12px]">تعداد کل</p>
            <span className="flex items-center gap-7 text-sm">
              {totalCount} عدد
            </span>
          </div> */}
        </div>
        <Button
          className="w-full dark:bg-(--base-green) dark:text-white"
          size="lg"
          onClick={sendDataToApi}
        >
          ثبت و نهایی کردن رزرو
        </Button>
      </div>
    </div>
  );
}

export default FoodReserveCardMobile;

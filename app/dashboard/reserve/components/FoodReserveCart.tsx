"use client";

import { Button } from "@/components/ui/button";
import { DirectionProvider } from "@/components/ui/direction";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingBasketIcon,
  WalletCardsIcon,
} from "lucide-react";
import type { ReserveCartItem } from "../types";
import ReserveCartItems from "./ReserveCartItems";

interface FoodReserveCartProps {
  reserveCart: ReserveCartItem[];
  sortedReserveCart: ReserveCartItem[];
  totalPrice: number;
  totalCount: number;
  sendDataToApi: () => Promise<void>;
  walletBalance: number | null;
}

function FoodReserveCart({
  reserveCart,
  sortedReserveCart,
  totalPrice,
  totalCount,
  sendDataToApi,
  walletBalance,
}: FoodReserveCartProps) {
  return (
    <div className="sticky top-20">
      <div className="p-2 rounded-t-md flex items-center gap-2">
        <ShoppingBasketIcon className="size-6 text-(--base-green)" />
        <p className="font-bold">سبد رزرو شما</p>
      </div>
      <div className="mx-3 mb-2 flex items-center justify-between rounded-xl border border-(--base-green)/20 bg-(--light-green) p-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-(--base-green)/15 text-(--base-green)">
            <WalletCardsIcon aria-hidden="true" className="size-5" />
          </span>
          <span className="text-sm text-(--secondary-text)">
            موجودی کیف پول
          </span>
        </div>
        <strong className="text-sm text-foreground">
          {walletBalance === null
            ? "نامشخص"
            : `${walletBalance.toLocaleString()} تومان`}
        </strong>
      </div>
      <DirectionProvider dir="rtl">
        <ScrollArea
          style={{ maxHeight: "calc(100vh - 240px)" }}
          className="h-auto  overflow-auto"
        >
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
      {reserveCart.length !== 0 ? (
        <div className="w-full flex flex-col gap-4 px-3">
          <div className="border-t">
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
    </div>
  );
}

export default FoodReserveCart;

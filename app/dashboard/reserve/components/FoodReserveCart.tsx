"use client";

import { Button } from "@/components/ui/button";
import { ShoppingBasketIcon, WalletCardsIcon } from "lucide-react";
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

export default function FoodReserveCart({ reserveCart, sortedReserveCart, totalPrice, totalCount, sendDataToApi, walletBalance }: FoodReserveCartProps) {
  return (
    <section aria-label="سبد رزرو شما" className="flex h-[calc(100dvh-8rem)] min-h-80 flex-col overflow-hidden rounded-2xl border border-(--base-green)/30 bg-zinc-50/70 shadow-sm dark:bg-zinc-900/50">
      <header className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
        <ShoppingBasketIcon className="size-5 text-(--base-green)" aria-hidden="true" />
        <h2 className="text-sm font-bold">سبد رزرو شما</h2>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" tabIndex={0} aria-label="غذاهای سبد رزرو">
        {reserveCart.length ? <ReserveCartItems items={sortedReserveCart} /> : (
          <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 px-3 text-center text-sm text-(--secondary-text)">
            <ShoppingBasketIcon className="size-9 text-(--base-green)" aria-hidden="true" />سبد رزرو شما خالی است.
          </div>
        )}
      </div>
      <footer className="flex shrink-0 flex-col gap-3 border-t p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-(--base-green)/20 bg-(--light-green) p-2.5 text-xs">
          <span className="flex items-center gap-1.5 text-(--secondary-text)"><WalletCardsIcon className="size-4 text-(--base-green)" aria-hidden="true" />موجودی کیف پول</span>
          <strong>{walletBalance === null ? "نامشخص" : walletBalance.toLocaleString("fa-IR") + " تومان"}</strong>
        </div>
        <div className="flex items-center justify-between text-sm"><span>مبلغ کل</span><strong>{totalPrice.toLocaleString("fa-IR")} تومان</strong></div>
        <div className="flex items-center justify-between text-xs"><span>تعداد کل</span><span>{totalCount.toLocaleString("fa-IR")} عدد</span></div>
        <Button className="h-auto min-h-10 w-full whitespace-normal dark:bg-(--base-green) dark:text-white" disabled={reserveCart.length === 0} onClick={sendDataToApi}>ثبت و نهایی کردن رزرو</Button>
      </footer>
    </section>
  );
}

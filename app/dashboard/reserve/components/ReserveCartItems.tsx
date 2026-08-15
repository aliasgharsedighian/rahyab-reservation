"use client";

import { Button } from "@/components/ui/button";
import { removeFromReserveBasket } from "@/redux/features/reserveBasketSlice";
import { CupSodaIcon, ForkKnifeIcon, SaladIcon, Trash2Icon } from "lucide-react";
import { useDispatch } from "react-redux";
import type { ReserveCartItem } from "../types";

const typeLabel = {
  lunch: "ناهار",
  dinner: "شام",
  drink: "نوشیدنی",
  appetizer: "پیش‌غذا",
};

export default function ReserveCartItems({ items }: { items: ReserveCartItem[] }) {
  const dispatch = useDispatch();
  const days = Object.values(
    items.reduce<Record<string, ReserveCartItem[]>>((result, item) => {
      (result[item.date || item.jalali_date] ??= []).push(item);
      return result;
    }, {}),
  );

  return (
    <div className="flex flex-col gap-4 p-3">
      {days.map((dayItems) => {
        const sortedDayItems = [...dayItems].sort((a, b) => {
          const order = { lunch: 0, dinner: 1, drink: 2, appetizer: 3 };
          return (a.type ? order[a.type] : 0) - (b.type ? order[b.type] : 0);
        });
        const first = sortedDayItems[0];
        const mainNames = sortedDayItems
          .filter((item) => item.type === "lunch" || item.type === "dinner" || !item.type)
          .map((item) => item.name)
          .join("، ");
        return (
          <section key={first.date || first.jalali_date} className="overflow-hidden rounded-xl border bg-background">
            <header className="border-b bg-(--light-green) px-3 py-2">
              <strong className="text-sm">{first.day} {first.jalali_date}</strong>
              {mainNames ? <p className="mt-1 truncate text-xs text-(--secondary-text)">غذای اصلی: {mainNames}</p> : null}
            </header>
            <div className="divide-y px-3">
              {sortedDayItems.map((item) => {
                const Icon = item.type === "drink" ? CupSodaIcon : item.type === "appetizer" ? SaladIcon : ForkKnifeIcon;
                const isSide = item.type === "drink" || item.type === "appetizer";
                return (
                  <div key={item.id} className={`flex items-start justify-between gap-2 py-3 ${isSide ? "mr-5 border-r-2 border-(--base-green)/25 pr-3" : ""}`}>
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="rounded-full bg-(--light-green) p-2"><Icon className="size-4 text-(--base-green)" /></span>
                      <div className="min-w-0 text-sm"><p className="font-medium">{item.name}</p><span className="text-xs text-(--secondary-text)">{item.type_fa || (item.type ? typeLabel[item.type] : "غذای اصلی")} · {item.count} عدد</span>{isSide ? <p className="mt-1 text-[11px] text-(--secondary-text)">همراه غذای اصلی این روز</p> : null}</div>
                    </div>
                    <Button variant="ghost" size="icon-sm" aria-label={`حذف ${item.name}`} onClick={() => dispatch(removeFromReserveBasket({ id: item.id }))}><Trash2Icon className="size-4 text-red-400" /></Button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

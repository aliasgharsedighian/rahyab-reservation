"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import WalletFilters from "../../components/WalletFilters";
import type { WalletTransaction } from "../types";

interface WalletTableProps {
  walletList: WalletTransaction[];
  revalidateData: () => Promise<void>;
}

export default function WalletTable({ walletList }: WalletTableProps) {
  return (
    <div className="min-w-0 space-y-4">
      <WalletFilters />
      {walletList.length === 0 ? (
        <p className="rounded-xl border bg-card p-8 text-center text-sm text-(--secondary-text)">موردی یافت نشد</p>
      ) : (
        <ul aria-label="تراکنش‌های کیف پول" className="space-y-3">
          {walletList.map(item => {
            const isCredit = item.type === "افزایش";
            const Icon = isCredit ? PlusIcon : MinusIcon;
            return (
              <li key={item.id}>
                <article className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl border bg-card p-4 sm:gap-4 sm:p-5">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className={"flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11 " + (isCredit ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400" : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400")}><Icon className="size-5" aria-hidden="true" /></span>
                    <div className="min-w-0 space-y-1.5">
                      <h3 className="font-bold leading-6">{item.type}</h3>
                      <p className="whitespace-pre-wrap text-sm leading-7 wrap-anywhere">{item.description}</p>
                      <p className="flex flex-wrap gap-x-1 text-xs leading-6 text-(--secondary-text)"><span>{item.created_day_name}،</span><bdi dir="ltr">{item.created_at_jalali}</bdi></p>
                    </div>
                  </div>
                  <p className={"max-w-28 break-all text-left text-sm font-bold leading-6 tabular-nums sm:max-w-40 " + (isCredit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}><bdi dir="ltr">{isCredit ? "+" : "−"}{Math.abs(item.amount).toLocaleString("fa-IR")}</bdi><span className="sr-only"> تومان</span></p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

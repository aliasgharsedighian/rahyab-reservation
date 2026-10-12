import { ArrowDownIcon, ArrowUpIcon, Wallet2Icon } from "lucide-react";
import WalletChargeGuideButton from "./WalletChargeGuideButton";
import type { WalletData } from "../types";

export default function WalletSummary({ wallet }: { wallet: Pick<WalletData, "balance" | "total_credit" | "total_debit"> }) {
  return (
    <section aria-label="خلاصه کیف پول" className="grid min-w-0 grid-cols-2 gap-3">
      <div className="col-span-2 flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-(--base-green)/25 bg-(--light-green) p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--base-green)/10 text-(--base-green) sm:size-12"><Wallet2Icon className="size-6" aria-hidden="true" /></span>
          <div className="min-w-0 space-y-2"><h2 className="text-sm text-(--secondary-text)">موجودی فعلی</h2><p className="break-words text-lg font-bold leading-7 text-(--base-green) sm:text-xl">{wallet.balance.toLocaleString("fa-IR")} تومان</p></div>
        </div>
        <WalletChargeGuideButton />
      </div>
      <div className="flex min-w-0 items-start gap-2 rounded-2xl border border-(--base-green)/20 bg-green-50 p-3 dark:bg-(--light-green) sm:items-center sm:gap-3 sm:p-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-(--base-green)/10 dark:text-(--base-green) sm:size-11"><ArrowUpIcon className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0 space-y-2"><h2 className="text-xs leading-5 text-green-700 dark:text-(--base-green) sm:text-sm">مجموع واریزی‌ها</h2><p className="flex flex-wrap gap-x-1 text-sm font-bold leading-7 text-green-800 dark:text-(--base-green) sm:text-lg"><span className="break-all">{wallet.total_credit.toLocaleString("fa-IR")}</span><span>تومان</span></p></div>
      </div>
      <div className="flex min-w-0 items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20 sm:items-center sm:gap-3 sm:p-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 sm:size-11"><ArrowDownIcon className="size-5" aria-hidden="true" /></span>
        <div className="min-w-0 space-y-2"><h2 className="text-xs leading-5 text-red-700 dark:text-red-400 sm:text-sm">مجموع هزینه‌ها</h2><p className="flex flex-wrap gap-x-1 text-sm font-bold leading-7 text-red-800 dark:text-red-400 sm:text-lg"><span className="break-all">{wallet.total_debit.toLocaleString("fa-IR")}</span><span>تومان</span></p></div>
      </div>
    </section>
  );
}

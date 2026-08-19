"use client";

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import WalletFilters from "../../components/WalletFilters";

interface WalletTransaction {
  id: number;
  type: "افزایش" | "کاهش";
  amount: number;
  description: string;
  created_at: string;
  created_at_jalali: string;
  created_day_name: string;
}

interface WalletTableProps {
  walletList: WalletTransaction[];
  revalidateData: () => Promise<void>;
}

function WalletTable({ walletList }: WalletTableProps) {
  return (
    <>
      <WalletFilters />
      <div className="w-full overflow-x-auto rounded-md">
        <div className="border border-border text-sm grid grid-cols-[50px_100px_50px_180px_100px_100px_100px] lg:grid-cols-12 bg-transparent text-(--secondary-text) rounded-t-md min-w-max lg:min-w-full">
          <div className="lg:col-span-1 p-2 md:p-4  flex items-center">
            ردیف
          </div>
          <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
            تاریخ
          </div>
          <div className="lg:col-span-2 p-2 md:p-4  flex items-center">نوع</div>
          <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
            مبلغ (تومان)
          </div>
          <div className="lg:col-span-5 p-4  flex items-center">توضیحات</div>
        </div>

        {walletList.length === 0 && (
          <div className="border border-border border-t-0 p-8 text-center text-(--secondary-text)">
            موردی یافت نشد
          </div>
        )}

        {walletList.map((item, index) => {
          const isCredit = item.type === "افزایش";
          const AmountIcon = isCredit ? ArrowUpIcon : ArrowDownIcon;

          return (
            <div
              key={item.id}
              className="border-l border-b text-sm grid grid-cols-[50px_100px_50px_180px_100px_100px_100px] lg:grid-cols-12 hover:bg-(--light-green) transition min-w-max lg:min-w-full"
            >
              <div className="lg:col-span-1 p-2 md:p-4 border-r flex items-center">
                {index + 1}
              </div>
              <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
                {item.created_at_jalali}
              </div>
              <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
                {item.type}
              </div>

              <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 ${
                    isCredit
                      ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400"
                      : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                  }`}
                >
                  <AmountIcon aria-hidden="true" className="size-4" />
                  {item.amount?.toLocaleString()}
                </span>
              </div>
              <div className="lg:col-span-5 p-2 md:p-4 flex items-center">
                {item.description}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default WalletTable;

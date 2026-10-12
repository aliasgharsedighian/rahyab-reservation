"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2Icon, EyeIcon, MessageSquareIcon, UtensilsIcon } from "lucide-react";
import { useState } from "react";
import CommentOnFoodModal from "./CommentOnFoodModal";
import ReservationFilters from "../../components/ReservationFilters";
import type { ReservationHistoryItem } from "../types";

interface ReserveHistoryTableProps {
  reserveHistory: ReservationHistoryItem[];
  revalidateData: () => void | Promise<void>;
}

function FeedbackStatus({ item }: { item: ReservationHistoryItem }) {
  const reviewed = item.has_feedback?.has_feedback;
  const Icon = reviewed ? CheckCircle2Icon : MessageSquareIcon;
  return (
    <span className={"inline-flex max-w-full items-center gap-1 rounded-lg border px-2 py-1 text-[11px] leading-4 " + (reviewed ? "border-(--base-green)/20 bg-(--light-green) text-(--base-green)" : "border-border bg-muted/50 text-(--secondary-text)")}>
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {reviewed ? "امتیاز داده‌اید" : "هنوز امتیاز نداده‌اید"}
    </span>
  );
}

export default function ReserveHistoryTable({ reserveHistory, revalidateData }: ReserveHistoryTableProps) {
  const [open, setOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const handleOpenModal = (foodId: number, id: number) => {
    setSelectedId(id);
    setSelectedFoodId(foodId);
    setOpen(true);
  };
  const moneyClass = (cancelled: boolean) => cancelled
    ? "bg-red-100/70 text-red-700 dark:bg-red-950/40 dark:text-red-300"
    : "bg-(--light-green) text-(--base-green)";
  const actionLabel = (item: ReservationHistoryItem) => item.has_feedback?.has_feedback ? "مشاهده امتیاز و نظر" : "ثبت امتیاز و نظر";

  return (
    <div className="@container/history min-w-0 space-y-4">
      <CommentOnFoodModal open={open} setOpen={setOpen} foodId={selectedFoodId} reservationId={selectedId}
        has_feedback={reserveHistory.find(item => item.id === selectedId)?.has_feedback} revalidateData={revalidateData} />
      <ReservationFilters compact />
      {reserveHistory.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center text-sm text-(--secondary-text)">موردی یافت نشد</div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border bg-card @min-[52rem]/history:block">
            <table className="w-full table-fixed border-collapse text-right text-xs">
              <caption className="sr-only">لیست غذاهای رزرو شده گذشته شما</caption>
              <colgroup><col className="w-[6%]" /><col className="w-[12%]" /><col className="w-[10%]" /><col /><col className="w-[6%]" /><col className="w-[13%]" /><col className="w-[13%]" /><col className="w-[8%]" /></colgroup>
              <thead className="border-b bg-muted/50 text-(--secondary-text)">
                <tr>{["ردیف", "تاریخ", "روز", "نام غذا", "تعداد", "قیمت واحد (تومان)", "جمع کل (تومان)", "جزئیات"].map(label => <th key={label} scope="col" className="px-2 py-4 text-center font-medium leading-5">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {reserveHistory.map((item, index) => {
                  const cancelled = item.status === "cancelled";
                  return (
                    <tr key={item.id} className={cancelled ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-300" : "transition-colors hover:bg-(--light-green)/40"}>
                      <td className="px-2 py-3 text-center tabular-nums">{(index + 1).toLocaleString("fa-IR")}</td>
                      <td className="px-2 py-3 text-center"><span dir="ltr" className="whitespace-nowrap tabular-nums">{item.reserve_date_jalali}</span></td>
                      <td className="px-2 py-3 text-center">{item.reserve_day_name}</td>
                      <th scope="row" className="space-y-1.5 break-words px-2 py-3 text-center font-medium leading-6"><p>{item.food_name}</p><FeedbackStatus item={item} />{cancelled ? <span className="sr-only">{item.status_fa}</span> : null}</th>
                      <td className="px-2 py-3 text-center tabular-nums">{item.quantity.toLocaleString("fa-IR")}</td>
                      <td className="px-2 py-3 text-center"><span className={"inline-block rounded-lg px-2 py-1.5 font-semibold tabular-nums " + moneyClass(cancelled)}>{item.unit_price.toLocaleString("fa-IR")}</span></td>
                      <td className="px-2 py-3 text-center"><span className={"inline-block rounded-lg px-2 py-1.5 font-semibold tabular-nums " + moneyClass(cancelled)}>{item.total_paid.toLocaleString("fa-IR")}</span></td>
                      <td className="px-2 py-3 text-center">{cancelled ? <span aria-label={item.status_fa}>—</span> : <Button variant="outline" size="icon" className="rounded-full" aria-label={actionLabel(item) + " برای " + item.food_name} onClick={() => handleOpenModal(item.food_id, item.id)}><EyeIcon className="size-4" /></Button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="grid min-w-0 gap-4 @min-[40rem]/history:grid-cols-2 @min-[52rem]/history:hidden">
            {reserveHistory.map((item, index) => {
              const cancelled = item.status === "cancelled";
              return (
                <article key={item.id} className={"min-w-0 space-y-4 rounded-2xl border p-4 shadow-sm " + (cancelled ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300" : "bg-card")}>
                  <header className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex min-w-0 items-center gap-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 font-bold">{(index + 1).toLocaleString("fa-IR")}</span><span className="flex flex-wrap gap-x-1 leading-6"><span>{item.reserve_day_name}</span><span dir="ltr" className="tabular-nums">{item.reserve_date_jalali}</span></span></span>
                    <span className={"rounded-lg px-2 py-1.5 font-medium " + (cancelled ? "bg-red-100/70 dark:bg-red-950/40" : "bg-(--light-green) text-(--base-green)")}>{item.status_fa}</span>
                  </header>
                  <div className="flex items-start gap-3">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted/50">
                      {item.food_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.food_image_url} alt={item.food_name} className="size-full object-cover" loading="lazy" />
                      ) : <UtensilsIcon className="size-6 text-(--secondary-text)" aria-hidden="true" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2"><h3 className="break-words text-base font-bold leading-7">{item.food_name}</h3><FeedbackStatus item={item} /></div>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-center">
                    {([["تعداد", item.quantity], ["قیمت واحد (تومان)", item.unit_price], ["جمع کل (تومان)", item.total_paid]] as const).map(([label, value]) => <div key={label} className={"min-w-0 rounded-xl px-1.5 py-2.5 " + (cancelled ? "bg-red-100/50 dark:bg-red-950/30" : "bg-muted/60")}><dt className="flex min-h-8 items-center justify-center text-[10px] leading-4 sm:text-xs">{label}</dt><dd className="mt-1 break-all text-sm font-bold leading-6 tabular-nums">{value.toLocaleString("fa-IR")}</dd></div>)}
                  </dl>
                  {!cancelled ? <Button variant="outline" className="min-h-11 w-full gap-2 border-(--base-green)/20 bg-(--light-green) text-(--base-green)" aria-label={actionLabel(item) + " برای " + item.food_name} onClick={() => handleOpenModal(item.food_id, item.id)}><EyeIcon className="size-4" />{actionLabel(item)}</Button> : null}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

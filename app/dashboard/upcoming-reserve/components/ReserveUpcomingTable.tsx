"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import ReservationListEmpty from "../../components/ReservationListEmpty";
import { UtensilsIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CancelReservationModal from "./CancelReservationModal";
import ReservationFilters from "../../components/ReservationFilters";
import type { ReservationUpcomingItem } from "../types";

interface ReserveUpcomingTableProps {
  reserveUpcoming: ReservationUpcomingItem[];
  revalidateData: () => void | Promise<void>;
}

export default function ReserveUpcomingTable({ reserveUpcoming, revalidateData }: ReserveUpcomingTableProps) {
  const searchParams = useSearchParams();
  const hasFilters = ["food_name", "reserve_date_from_jalali", "reserve_date_to_jalali", "status"].some(key => Boolean(searchParams.get(key)));
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const handleOpenModal = (id: number) => { setSelectedId(id); setOpen(true); };
  const moneyClass = (cancelled: boolean) => cancelled
    ? "bg-red-100/70 text-red-700 dark:bg-red-950/40 dark:text-red-300"
    : "bg-(--light-green) text-(--base-green)";
  const rowClass = (cancelled: boolean) => cancelled
    ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
    : "border-(--base-green)/25 bg-(--light-green)";

  return (
    <div className="@container/upcoming min-w-0 space-y-4">
      <CancelReservationModal open={open} setOpen={setOpen} reservationId={selectedId}
        reservation={reserveUpcoming.find(item => item.id === selectedId)} revalidateData={revalidateData} />
      <ReservationFilters compact />
      {reserveUpcoming.length === 0 ? (
        <ReservationListEmpty variant="upcoming" filtered={hasFilters} />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border @min-[52rem]/upcoming:block">
            <table className="w-full table-fixed border-collapse text-right text-xs">
              <caption className="sr-only">لیست غذاهای رزرو شده پیش روی شما</caption>
              <colgroup><col className="w-[6%]" /><col className="w-[12%]" /><col className="w-[10%]" /><col /><col className="w-[6%]" /><col className="w-[13%]" /><col className="w-[13%]" /><col className="w-[8%]" /></colgroup>
              <thead className="border-b bg-muted/50 text-(--secondary-text)">
                <tr>{["ردیف", "تاریخ", "روز", "نام غذا", "تعداد", "قیمت واحد (تومان)", "جمع کل (تومان)", "لغو"].map(label => <th key={label} scope="col" className="px-2 py-4 text-center font-medium leading-5">{label}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {reserveUpcoming.map((item, index) => {
                  const cancelled = item.status === "cancelled";
                  return (
                    <tr key={item.id} className={rowClass(cancelled)}>
                      <td className="px-2 py-3 text-center tabular-nums">{(index + 1).toLocaleString("fa-IR")}</td>
                      <td className="px-2 py-3 text-center"><span dir="ltr" className="whitespace-nowrap tabular-nums">{item.reserve_date_jalali}</span></td>
                      <td className="px-2 py-3 text-center">{item.reserve_day_name}</td>
                      <th scope="row" className="break-words px-2 py-3 text-center font-medium leading-6">{item.food_name}</th>
                      <td className="px-2 py-3 text-center tabular-nums">{item.quantity.toLocaleString("fa-IR")}</td>
                      <td className="px-2 py-3 text-center"><span className={"inline-block rounded-lg px-2 py-1.5 font-semibold tabular-nums " + moneyClass(cancelled)}>{item.unit_price.toLocaleString("fa-IR")}</span></td>
                      <td className="px-2 py-3 text-center"><span className={"inline-block rounded-lg px-2 py-1.5 font-semibold tabular-nums " + moneyClass(cancelled)}>{item.total_paid.toLocaleString("fa-IR")}</span></td>
                      <td className="px-2 py-3 text-center">{cancelled ? <span className="text-[11px]">{item.status_fa}</span> : <Button variant="outline" size="icon" className="rounded-full border-red-300/70 bg-transparent text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-300/40 dark:text-red-300 dark:hover:bg-red-950/40" aria-label={"لغو رزرو " + item.food_name} onClick={() => handleOpenModal(item.id)}><XIcon className="size-4" /></Button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="grid min-w-0 gap-4 @min-[40rem]/upcoming:grid-cols-2 @min-[52rem]/upcoming:hidden">
            {reserveUpcoming.map((item, index) => {
              const cancelled = item.status === "cancelled";
              return (
                <article key={item.id} className={"min-w-0 space-y-4 rounded-2xl border p-4 shadow-sm " + rowClass(cancelled)}>
                  <header className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex min-w-0 items-center gap-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 font-bold">{(index + 1).toLocaleString("fa-IR")}</span><span className="flex flex-wrap gap-x-1 leading-6"><span>{item.reserve_day_name}</span><span dir="ltr" className="tabular-nums">{item.reserve_date_jalali}</span></span></span>
                    <span className={"rounded-lg px-2 py-1.5 font-medium " + (cancelled ? "bg-red-100/70 dark:bg-red-950/40" : "bg-(--light-green) text-(--base-green)")}>{item.status_fa}</span>
                  </header>
                  <div className="flex items-center gap-3">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted/50">
                      {item.food_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.food_image_url} alt={item.food_name} className="size-full object-cover" loading="lazy" />
                      ) : <UtensilsIcon className="size-6 text-(--secondary-text)" aria-hidden="true" />}
                    </div>
                    <h3 className="min-w-0 flex-1 break-words text-base font-bold leading-7">{item.food_name}</h3>
                  </div>
                  <dl className="grid grid-cols-3 gap-2 text-center">
                    {([["تعداد", item.quantity], ["قیمت واحد (تومان)", item.unit_price], ["جمع کل (تومان)", item.total_paid]] as const).map(([label, value]) => <div key={label} className={"min-w-0 rounded-xl px-1.5 py-2.5 " + (cancelled ? "bg-red-100/50 dark:bg-red-950/30" : "bg-muted/60")}><dt className="flex min-h-8 items-center justify-center text-[10px] leading-4 sm:text-xs">{label}</dt><dd className="mt-1 break-all text-sm font-bold leading-6 tabular-nums">{value.toLocaleString("fa-IR")}</dd></div>)}
                  </dl>
                  {!cancelled ? <Button variant="outline" className="min-h-11 w-full gap-2 border-red-300/70 bg-transparent text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-300/40 dark:text-red-300 dark:hover:bg-red-950/40" aria-label={"لغو رزرو " + item.food_name} onClick={() => handleOpenModal(item.id)}><XIcon className="size-4" />لغو رزرو</Button> : null}
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

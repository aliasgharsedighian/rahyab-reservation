import { DashboardHeaderSkeleton, LoadingBlock } from "./DashboardLoadingSkeleton";

const rows = Array.from({ length: 6 }, (_, index) => index);

export default function ReservationListSkeleton({ variant }: { variant: "history" | "upcoming" }) {
  const history = variant === "history";
  const title = history ? "رزروهای گذشته" : "رزروهای پیش رو";
  const columns = ["ردیف", "تاریخ", "روز", "نام غذا", "تعداد", "قیمت واحد (تومان)", "جمع کل (تومان)", history ? "جزئیات" : "لغو"];

  return (
    <div role="status" aria-busy="true" className="mb-10 flex w-full flex-col gap-6">
      <span className="sr-only">در حال دریافت {title}...</span>
      <div aria-hidden="true" className="contents">
        <DashboardHeaderSkeleton title={title} />
        <div className="flex w-full flex-col gap-3">
          <div className="mx-2 flex flex-col gap-4 md:mx-6">
            <div className="mb-2 flex flex-col gap-2">
              <h2 className="text-2xl font-bold sm:text-3xl">{history ? "رزرو‌های گذشته" : "رزرو‌های پیش رو"}</h2>
              <p className="text-(--secondary-text)">لیست غذاهای رزرو شده {history ? "گذشته" : "پیش روی"} شما</p>
            </div>
            <div className="@container/reservations min-w-0 space-y-4">
              <div className="flex min-h-16 items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <LoadingBlock className="size-5" />
                  <div className="space-y-2"><LoadingBlock className="h-4 w-24" /><LoadingBlock className="h-3 w-16" /></div>
                </div>
                <LoadingBlock className="size-9 rounded-full bg-(--light-green)" />
              </div>
              <div className="hidden overflow-hidden rounded-xl border bg-card @min-[52rem]/reservations:block">
                <table className="w-full table-fixed border-collapse text-right text-xs">
                  <colgroup><col className="w-[6%]" /><col className="w-[12%]" /><col className="w-[10%]" /><col /><col className="w-[6%]" /><col className="w-[13%]" /><col className="w-[13%]" /><col className="w-[8%]" /></colgroup>
                  <thead className="border-b bg-muted/50 text-(--secondary-text)">
                    <tr>{columns.map(label => <th key={label} className="px-2 py-4 text-center font-medium leading-5">{label}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {rows.map(row => (
                      <tr key={row} className={history ? "" : "bg-(--light-green)"}>
                        {columns.map((column, index) => (
                          <td key={column} className="px-2 py-3">
                            {index === 3 ? (
                              <div className="flex flex-col items-center gap-1.5 py-1"><LoadingBlock className="h-4 w-4/5" />{history && <LoadingBlock className="h-6 w-28 rounded-lg" />}</div>
                            ) : <LoadingBlock className={index === 7 ? "mx-auto size-8 rounded-full" : index === 5 || index === 6 ? "mx-auto h-7 w-4/5 rounded-lg" : "mx-auto h-4 w-3/4"} />}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid min-w-0 gap-4 @min-[40rem]/reservations:grid-cols-2 @min-[52rem]/reservations:hidden">
                {rows.map(row => (
                  <div key={row} className={"min-w-0 space-y-4 rounded-2xl border p-4 shadow-sm " + (history ? "bg-card" : "border-(--base-green)/25 bg-(--light-green)")}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2"><LoadingBlock className="size-8 rounded-lg" /><LoadingBlock className="h-4 w-28" /></div>
                      <LoadingBlock className="h-7 w-16 rounded-lg" />
                    </div>
                    <div className="flex items-start gap-3">
                      <LoadingBlock className="size-16 shrink-0 rounded-xl" />
                      <div className="min-w-0 flex-1 space-y-2 py-1"><LoadingBlock className="h-5 w-4/5" />{history && <LoadingBlock className="h-6 w-28 rounded-lg" />}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {rows.slice(0, 3).map(cell => <div key={cell} className="min-w-0 rounded-xl bg-muted/60 px-1.5 py-2.5"><div className="flex min-h-8 items-center justify-center"><LoadingBlock className="h-3 w-4/5" /></div><LoadingBlock className="mx-auto mt-1 h-6 w-3/4" /></div>)}
                    </div>
                    <LoadingBlock className={"h-11 w-full rounded-lg border " + (history ? "border-(--base-green)/20 bg-(--light-green)" : "border-red-300/40")} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">{rows.slice(0, 5).map(page => <LoadingBlock key={page} className="h-9 w-9 rounded-sm" />)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

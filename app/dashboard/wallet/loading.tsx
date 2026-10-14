import { DashboardHeaderSkeleton, LoadingBlock } from "../components/DashboardLoadingSkeleton";

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mb-10 flex w-full flex-col gap-6">
      <span className="sr-only">در حال دریافت اطلاعات کیف پول...</span>
      <div aria-hidden="true" className="contents">
        <DashboardHeaderSkeleton title="کیف پول" />
        <div className="mx-2 md:mx-6">
          <div className="mx-auto grid w-full max-w-5xl min-w-0 grid-cols-2 gap-3">
            <div className="col-span-2 flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-(--base-green)/25 bg-(--light-green) p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <LoadingBlock className="size-11 shrink-0 rounded-full bg-(--base-green)/10 sm:size-12" />
                <div className="min-w-0 space-y-2"><p className="text-sm text-(--secondary-text)">موجودی فعلی</p><LoadingBlock className="h-7 w-32 max-w-full" /></div>
              </div>
              <LoadingBlock className="size-11 shrink-0 rounded-full bg-(--base-green)/20" />
            </div>
            {["مجموع واریزی‌ها", "مجموع هزینه‌ها"].map((title, index) => (
              <div key={title} className={"flex min-w-0 items-start gap-2 rounded-2xl border p-3 sm:items-center sm:gap-3 sm:p-5 " + (index === 0 ? "border-(--base-green)/20 bg-green-50 dark:bg-(--light-green)" : "border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/20")}>
                <LoadingBlock className="size-8 shrink-0 rounded-full sm:size-11" />
                <div className="min-w-0 space-y-2"><p className="text-xs leading-5 text-(--secondary-text) sm:text-sm">{title}</p><LoadingBlock className="h-7 w-24 max-w-full sm:w-32" /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex w-full flex-col gap-3">
          <div className="mx-2 flex min-w-0 flex-col gap-4 md:mx-6">
            <div className="mx-auto w-full max-w-5xl space-y-5">
              <div className="mb-2 flex flex-col gap-2">
                <h2 className="text-2xl font-bold sm:text-3xl">تراکنش‌های کیف پول</h2>
                <p className="text-(--secondary-text)">لیست دریافتی‌ها و پرداختی‌های شما</p>
              </div>
              <div className="min-w-0 space-y-4">
                <div className="flex min-h-16 items-center justify-between rounded-xl border bg-card px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3"><LoadingBlock className="size-5" /><div className="space-y-2"><LoadingBlock className="h-4 w-24" /><LoadingBlock className="h-3 w-16" /></div></div>
                  <LoadingBlock className="size-9 rounded-full bg-(--light-green)" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div key={index} className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-xl border bg-card p-4 sm:gap-4 sm:p-5">
                      <div className="flex min-w-0 items-start gap-3">
                        <LoadingBlock className={"size-10 shrink-0 rounded-full sm:size-11 " + (index % 2 === 0 ? "bg-green-100 dark:bg-green-950/50" : "bg-red-100 dark:bg-red-950/50")} />
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <LoadingBlock className="my-1 h-4 w-16" />
                          <div className="flex min-h-7 items-center"><LoadingBlock className="h-4 w-full max-w-96" /></div>
                          <div className="flex min-h-6 items-center"><LoadingBlock className="h-3 w-28 max-w-full sm:w-36" /></div>
                        </div>
                      </div>
                      <LoadingBlock className="mt-1 h-4 w-16 sm:w-28" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">{[0, 1, 2, 3, 4].map(page => <LoadingBlock key={page} className="size-9 rounded-sm" />)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

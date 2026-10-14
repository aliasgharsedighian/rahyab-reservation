import { DashboardHeaderSkeleton, LoadingBlock } from "../components/DashboardLoadingSkeleton";

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mb-10 flex w-full flex-col gap-6">
      <span className="sr-only">در حال دریافت اعلان‌ها...</span>
      <div aria-hidden="true" className="contents">
        <DashboardHeaderSkeleton title="اعلان ها" />
        <div dir="rtl" className="mx-2 min-w-0 space-y-6 md:mx-6">
          <div className="space-y-2 text-right">
            <h2 className="text-2xl font-bold">اعلان‌ها</h2>
            <p className="text-sm text-(--secondary-text)">لیست همه‌ی اعلان‌های شما</p>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="flex w-full items-start gap-3 px-3 py-4 sm:items-center sm:gap-4 sm:px-5">
                <LoadingBlock className="mt-0.5 size-9 shrink-0 rounded-full bg-(--light-green) sm:mt-0" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="space-y-3 py-1.5">
                    <LoadingBlock className={index % 2 === 0 ? "h-4 w-5/6 max-w-2xl" : "h-4 w-2/3 max-w-xl"} />
                    <LoadingBlock className="h-4 w-1/2 sm:hidden" />
                  </div>
                  <LoadingBlock className="h-4 w-28" />
                  <LoadingBlock className="h-6 w-20 rounded-md sm:hidden" />
                </div>
                <LoadingBlock className="hidden h-6 w-20 shrink-0 rounded-md sm:block" />
              </div>
            ))}
          </div>
        </div>
        <div className="ml-auto mr-4 flex gap-3">{[0, 1, 2, 3, 4].map(page => <LoadingBlock key={page} className="size-9 rounded-sm" />)}</div>
      </div>
    </div>
  );
}

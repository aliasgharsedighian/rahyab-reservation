import { DashboardHeaderSkeleton, LoadingBlock } from "../components/DashboardLoadingSkeleton";

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mb-10 flex w-full flex-col gap-6">
      <span className="sr-only">در حال دریافت اعلان‌ها...</span>
      <div aria-hidden="true" className="contents">
        <DashboardHeaderSkeleton title="اعلان‌ها" />
        <div dir="rtl" className="mx-auto w-full max-w-5xl min-w-0 space-y-5 px-3 md:px-6">
          <div className="flex items-center gap-3 rounded-2xl border p-4 sm:p-5">
            <LoadingBlock className="size-11 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <LoadingBlock className="h-4 w-32" />
              <LoadingBlock className="h-3 w-3/4" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-lg font-bold sm:text-xl">همهٔ اعلان‌ها</h2>
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="flex w-full items-start gap-3 px-3 py-3.5 sm:px-4">
                  <LoadingBlock className="size-9 shrink-0 rounded-xl" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <LoadingBlock className={index % 2 === 0 ? "h-4 w-5/6 max-w-2xl" : "h-4 w-2/3 max-w-xl"} />
                    <LoadingBlock className="h-3 w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

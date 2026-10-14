import { LoadingBlock } from "../../components/DashboardLoadingSkeleton";

export default function ReservePageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="flex w-full items-start gap-5 px-2 md:px-5 xl:gap-8">
      <span className="sr-only">در حال دریافت منوی غذا...</span>
      <div aria-hidden="true" className="min-w-0 flex-1 space-y-4">
        <div className="flex h-9 items-center gap-1 rounded-lg bg-(--light-green) p-1">
          {[0, 1, 2].map(week => <LoadingBlock key={week} className="h-7 flex-1 bg-background/70" />)}
        </div>
        <LoadingBlock className="mx-auto mb-5 h-4 w-48" />
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-zinc-800">
          <div className="flex items-center gap-2 border-b bg-zinc-50 px-3 py-3 dark:bg-zinc-800">
            <span className="h-7 w-1 rounded-full bg-(--base-green)" />
            <LoadingBlock className="h-5 w-16" /><LoadingBlock className="h-4 w-24" />
            <LoadingBlock className="mr-auto h-6 w-12 rounded-lg" /><LoadingBlock className="size-4" />
          </div>
          <div className="@container/foods space-y-3 p-2 sm:p-3">
            <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 @min-[38rem]/foods:grid-cols-3 @min-[52rem]/foods:grid-cols-4 xl:mx-auto xl:max-w-[72rem]">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-zinc-50/70 p-2 dark:bg-zinc-900/50">
                  <LoadingBlock className="aspect-square w-full rounded-lg xl:aspect-[4/3]" />
                  <div className="flex flex-1 flex-col gap-2 pt-3">
                    <div className="min-h-12 space-y-2"><LoadingBlock className="h-5 w-4/5" /><LoadingBlock className="h-4 w-1/2" /></div>
                    <LoadingBlock className="h-7 w-full rounded-xl bg-amber-100/70 dark:bg-amber-100/20" />
                    <LoadingBlock className="h-5 w-24 max-w-full" />
                    <div className="mt-auto pt-1"><LoadingBlock className="h-10 w-full bg-(--light-green)" /></div>
                    <LoadingBlock className="h-4 w-20 max-w-full" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-xl border border-(--base-green)/30 bg-(--light-green)/30 p-3 md:p-4">
              <div className="space-y-2"><LoadingBlock className="h-4 w-28" /><LoadingBlock className="h-3 w-48 max-w-full" /></div>
              <LoadingBlock className="size-5 shrink-0" />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="sticky top-25 hidden w-[32%] min-w-64 max-w-sm shrink-0 self-start md:block">
        <div className="flex h-[calc(100dvh-8rem)] min-h-80 flex-col overflow-hidden rounded-2xl border border-(--base-green)/30 bg-zinc-50/70 shadow-sm dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 border-b px-4 py-3"><LoadingBlock className="size-5" /><LoadingBlock className="h-4 w-28" /></div>
          <div className="flex min-h-32 flex-1 flex-col items-center justify-center gap-3 p-3"><LoadingBlock className="size-9 rounded-full" /><LoadingBlock className="h-4 w-36" /></div>
          <div className="flex flex-col gap-3 border-t p-3">
            <LoadingBlock className="h-12 rounded-lg bg-(--light-green)" />
            {[0, 1].map(row => <div key={row} className="flex justify-between gap-2"><LoadingBlock className="h-4 w-16" /><LoadingBlock className="h-4 w-24" /></div>)}
            <LoadingBlock className="h-10 w-full bg-(--light-green)" />
          </div>
        </div>
      </div>
    </div>
  );
}

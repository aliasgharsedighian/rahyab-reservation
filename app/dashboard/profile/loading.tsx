import { DashboardHeaderSkeleton, LoadingBlock } from "../components/DashboardLoadingSkeleton";

const accountFields = ["شرکت", "دپارتمان", "کد پرسنلی", "دسترسی", "موبایل", "ایمیل"];
const passwordFields = ["رمز عبور فعلی", "رمز عبور جدید", "تکرار رمز عبور جدید"];

function StatisticsSkeleton({ title }: { title: string }) {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4">
      <h2 className="text-sm font-bold">{title}</h2>
      <div className="grid grid-cols-2">
        {["تعداد سفارش", "مبلغ پرداختی"].map((label, index) => (
          <div key={label} className={"min-w-0 space-y-2 px-2 text-center " + (index === 0 ? "border-l" : "")}>
            <LoadingBlock className="mx-auto size-5" />
            <p className="text-xs text-muted-foreground">{label}</p>
            <LoadingBlock className="mx-auto h-6 w-20 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mb-10 flex w-full flex-col gap-6">
      <span className="sr-only">در حال دریافت پروفایل کاربری...</span>
      <div aria-hidden="true" className="contents">
        <DashboardHeaderSkeleton title="پروفایل کاربری" />
        <div className="@container/profile mx-auto w-full max-w-7xl min-w-0 space-y-5 px-3 sm:px-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold sm:text-3xl">پروفایل کاربری</h1>
            <p className="text-sm leading-6 text-muted-foreground">اطلاعات حساب و تنظیمات خود را مدیریت کنید.</p>
          </div>
          <div className="grid gap-3 @min-[54rem]/profile:grid-flow-col @min-[54rem]/profile:auto-cols-fr">
            {["اعلان روی این دستگاه", "ظاهر برنامه"].map((title) => (
              <div key={title} className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 sm:gap-4 sm:p-5">
                <LoadingBlock className="size-11 shrink-0 rounded-xl" />
                <div className="min-w-0 grow space-y-2">
                  <h2 className="text-sm font-bold">{title}</h2>
                  <LoadingBlock className="h-4 w-28 max-w-full" />
                </div>
                <LoadingBlock className="h-8 w-20" />
              </div>
            ))}
          </div>
          <div className="grid min-w-0 items-start gap-4 @min-[59rem]/profile:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="@container/profile-form min-w-0 space-y-4" dir="rtl">
              <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="flex items-center gap-4 border-b bg-linear-to-l from-(--light-green) to-card p-4 sm:gap-5 sm:p-6">
                  <LoadingBlock className="size-16 shrink-0 rounded-full border sm:size-20" />
                  <LoadingBlock className="h-7 w-40 max-w-full" />
                </div>
                <div className="grid gap-4 px-4 py-5 @min-[24rem]/profile-form:grid-cols-2 @min-[38rem]/profile-form:grid-cols-3 sm:px-6">
                  {accountFields.map((label) => (
                    <div key={label} className="min-w-0 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <LoadingBlock className="size-4" />
                        <span>{label}</span>
                      </div>
                      <LoadingBlock className="ms-6 h-4 w-20" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 @min-[42rem]/profile-form:grid-cols-2">
                <div className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
                  <h2 className="text-lg font-bold">علاقه‌مندی‌ها</h2>
                  <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <div className="flex flex-wrap gap-2">{[0, 1, 2, 3, 4, 5].map(tag => <LoadingBlock key={tag} className={tag % 2 === 0 ? "h-9 w-20 rounded-lg" : "h-9 w-24 rounded-lg"} />)}</div>
                    <LoadingBlock className="min-h-28 w-full flex-1 rounded-lg bg-muted/50" />
                    <LoadingBlock className="mt-auto h-11 w-full shrink-0 rounded-lg bg-(--light-green)" />
                  </div>
                </div>
                <div className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
                  <h2 className="text-lg font-bold">تغییر رمز عبور</h2>
                  <div className="flex flex-1 flex-col gap-4">
                    {passwordFields.map(label => <div key={label} className="space-y-2"><p className="text-sm font-medium">{label}</p><LoadingBlock className="h-11 w-full rounded-lg bg-muted/50" /></div>)}
                    <LoadingBlock className="mt-auto h-11 w-full shrink-0 rounded-lg bg-(--light-green)" />
                  </div>
                </div>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 @min-[40rem]/profile:grid-cols-3 @min-[59rem]/profile:grid-cols-1">
              <StatisticsSkeleton title="یک ماه اخیر" />
              <StatisticsSkeleton title="کل سفارش‌ها" />
              <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                <h2 className="text-sm font-bold">بازخوردها</h2>
                <div className="flex items-center gap-3"><LoadingBlock className="size-6" /><LoadingBlock className="h-7 w-8" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

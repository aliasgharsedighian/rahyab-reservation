import { DashboardHeaderSkeleton, LoadingBlock } from "../components/DashboardLoadingSkeleton";

const personalFields = ["نام", "نام خانوادگی", "موبایل", "ایمیل", "کد پرسنلی", "شرکت", "دپارتمان", "دسترسی"];
const passwordFields = ["رمز عبور فعلی", "رمز عبور جدید", "تکرار رمز عبور جدید"];

function StatisticsSkeleton({ title }: { title: string }) {
  return (
    <div className="space-y-5 rounded-xl border bg-card p-4 sm:p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="grid grid-cols-2">
        {["تعداد سفارش", "مبلغ پرداختی"].map((label, index) => (
          <div key={label} className={"min-w-0 space-y-2 px-2 text-center " + (index === 0 ? "border-l" : "")}>
            <LoadingBlock className="mx-auto size-6" />
            <p className="text-xs text-(--secondary-text) sm:text-sm">{label}</p>
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
        <div className="mx-2 min-w-0 md:mx-6">
          <div className="w-full space-y-4">
            <div className="mb-6 space-y-2">
              <h1 className="text-2xl font-bold sm:text-3xl">پروفایل کاربری</h1>
              <p className="text-sm leading-7 text-(--secondary-text)">اطلاعات حساب کاربری خود را مدیریت کنید.</p>
            </div>
            <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="@container/profile-form min-w-0 space-y-4" dir="rtl">
                <div className="flex min-w-0 items-start gap-4 rounded-xl border bg-card p-4 sm:items-center sm:p-5">
                  <div className="relative shrink-0">
                    <LoadingBlock className="size-20 rounded-full border sm:size-24" />
                    <LoadingBlock className="absolute -bottom-1 -left-1 size-8 rounded-full border bg-(--light-green)" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <LoadingBlock className="h-7 w-40 max-w-full" />
                    <div className="space-y-1.5">
                      {[0, 1, 2, 3].map(line => <div key={line} className="flex min-h-6 items-center gap-2"><LoadingBlock className="size-4 shrink-0" /><LoadingBlock className={line % 2 === 0 ? "h-3 w-40 max-w-full" : "h-3 w-28 max-w-full"} /></div>)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
                  <h2 className="text-lg font-bold">اطلاعات شخصی</h2>
                  <div className="grid min-w-0 grid-cols-1 gap-4 @min-[30rem]/profile-form:grid-cols-2">
                    {personalFields.map(label => <div key={label} className="min-w-0 space-y-2"><p className="text-sm font-medium">{label}</p><LoadingBlock className="h-11 w-full rounded-lg bg-muted/50" /></div>)}
                  </div>
                </div>
                <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 @min-[42rem]/profile-form:grid-cols-2">
                  <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
                    <h2 className="text-lg font-bold">علاقه‌مندی‌ها</h2>
                    <div className="flex min-w-0 flex-1 flex-col gap-4">
                      <div className="flex flex-wrap gap-2">{[0, 1, 2, 3, 4, 5].map(tag => <LoadingBlock key={tag} className={tag % 2 === 0 ? "h-9 w-20 rounded-lg" : "h-9 w-24 rounded-lg"} />)}</div>
                      <LoadingBlock className="min-h-28 w-full flex-1 rounded-lg bg-muted/50" />
                      <LoadingBlock className="mt-auto h-11 w-full shrink-0 rounded-lg bg-(--light-green)" />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
                    <h2 className="text-lg font-bold">تغییر رمز عبور</h2>
                    <div className="flex flex-1 flex-col gap-4">
                      {passwordFields.map(label => <div key={label} className="space-y-2"><p className="text-sm font-medium">{label}</p><LoadingBlock className="h-11 w-full rounded-lg bg-muted/50" /></div>)}
                      <LoadingBlock className="mt-auto h-11 w-full shrink-0 rounded-lg bg-(--light-green)" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="min-w-0 space-y-4">
                <StatisticsSkeleton title="یک ماه اخیر" />
                <StatisticsSkeleton title="کلی" />
                <div className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 sm:p-5">
                  <h2 className="text-lg font-bold">بازخوردها</h2>
                  <div className="flex items-center gap-3"><LoadingBlock className="size-6" /><LoadingBlock className="h-7 w-8" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

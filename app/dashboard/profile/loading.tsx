import {
  BanknoteIcon,
  BellIcon,
  Building2Icon,
  CameraIcon,
  EyeIcon,
  IdCardIcon,
  LayersIcon,
  MailIcon,
  MessageSquareIcon,
  MoonStarIcon,
  PaletteIcon,
  PhoneCallIcon,
  ShieldCheckIcon,
  SunIcon,
  UtensilsIcon,
} from "lucide-react";
import { DashboardHeaderSkeleton, LoadingBlock } from "../components/DashboardLoadingSkeleton";

const accountFields = [
  { label: "شرکت", icon: Building2Icon, width: "w-28" },
  { label: "دپارتمان", icon: LayersIcon, width: "w-14" },
  { label: "کد پرسنلی", icon: IdCardIcon, width: "w-16" },
  { label: "دسترسی", icon: ShieldCheckIcon, width: "w-20" },
  { label: "موبایل", icon: PhoneCallIcon, width: "w-24" },
  { label: "ایمیل", icon: MailIcon, width: "w-32" },
];
const passwordFields = ["رمز عبور فعلی", "رمز عبور جدید", "تکرار رمز عبور جدید"];
const stats = [
  { label: "تعداد سفارش", icon: UtensilsIcon },
  { label: "مبلغ پرداختی", icon: BanknoteIcon, unit: "تومان" },
];

function StatisticsSkeleton({ title }: { title: string }) {
  return (
    <section className="space-y-4 rounded-2xl border bg-card p-4">
      <h2 className="text-sm font-bold">{title}</h2>
      <dl className="grid grid-cols-2">
        {stats.map(({ label, icon: Icon, unit }) => (
          <div key={label} className="min-w-0 space-y-2 px-2 text-center first:border-e">
            <dt className="space-y-2 text-xs text-muted-foreground">
              <Icon className="mx-auto size-5 text-green-700 dark:text-(--base-green)" />
              <span className="block">{label}</span>
            </dt>
            <dd className="flex min-h-6 flex-wrap items-center justify-center gap-x-1">
              <LoadingBlock className={unit ? "h-4 w-12 max-w-full" : "h-4 w-6"} />
              {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function Loading() {
  return (
    <div role="status" aria-busy="true" className="mb-10 flex w-full flex-col gap-6">
      <span className="sr-only">در حال دریافت پروفایل کاربری...</span>
      <div aria-hidden="true" className="contents">
        <DashboardHeaderSkeleton title="پروفایل کاربری" />
        <div className="@container/profile mx-auto w-full max-w-7xl min-w-0 space-y-5 px-3 sm:px-6">
          <header className="space-y-2">
            <h1 className="text-2xl font-bold sm:text-3xl">پروفایل کاربری</h1>
            <p className="text-sm leading-6 text-muted-foreground">اطلاعات حساب و تنظیمات خود را مدیریت کنید.</p>
          </header>
          <div className="grid gap-3 @min-[54rem]/profile:grid-flow-col @min-[54rem]/profile:auto-cols-fr">
            {process.env.NEXT_PUBLIC_BAAS_API_KEY && (
              <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 sm:gap-4 sm:p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <BellIcon className="size-5" />
                </span>
                <div className="min-w-0 basis-40 grow space-y-1">
                  <h2 className="text-sm font-bold">اعلان روی این دستگاه</h2>
                  <div className="flex h-6 items-center">
                    <LoadingBlock className="h-3 w-56 max-w-full" />
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <LoadingBlock className="h-3 w-8" />
                  <div className="relative h-6 w-11">
                    <LoadingBlock className="h-full w-full rounded-full border" />
                    <span className="absolute start-1 top-1 size-4 rounded-full bg-card" />
                  </div>
                </div>
              </section>
            )}
            <section className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 sm:gap-4 sm:p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                <PaletteIcon className="size-5" />
              </span>
              <div className="min-w-0 grow space-y-1">
                <h2 className="text-sm font-bold">ظاهر برنامه</h2>
                <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
                  <span className="dark:hidden">حالت فعلی روشن است.</span>
                  <span className="hidden dark:inline">حالت فعلی تیره است.</span>
                </p>
              </div>
              <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-muted-foreground dark:border-input dark:bg-input/30">
                <SunIcon className="hidden size-4 dark:block" />
                <MoonStarIcon className="size-4 dark:hidden" />
                <LoadingBlock className="h-3 w-24 dark:bg-input" />
              </div>
            </section>
          </div>
          <div className="grid min-w-0 items-start gap-4 @min-[59rem]/profile:grid-cols-[minmax(0,1fr)_16rem]">
            <div className="@container/profile-form min-w-0 space-y-4" dir="rtl">
              <section className="min-w-0 overflow-hidden rounded-2xl border bg-card">
                <div className="flex min-w-0 items-center gap-4 border-b bg-linear-to-l from-(--light-green) to-card p-4 sm:gap-5 sm:p-6">
                  <div className="relative shrink-0">
                    <LoadingBlock className="size-16 rounded-full border sm:size-20" />
                    <span className="absolute -bottom-1 -left-1 grid size-7 place-items-center rounded-full border bg-card text-green-700 shadow-sm dark:text-(--base-green)">
                      <CameraIcon className="size-4" />
                    </span>
                  </div>
                  <LoadingBlock className="h-5 w-44 min-w-0 sm:h-6 sm:w-56" />
                </div>
                <dl className="grid gap-4 px-4 py-5 @min-[24rem]/profile-form:grid-cols-2 @min-[38rem]/profile-form:grid-cols-3 sm:px-6">
                  {accountFields.map(({ label, icon: Icon, width }) => (
                    <div key={label} className="min-w-0 space-y-1">
                      <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className="size-4 shrink-0 text-green-700 dark:text-(--base-green)" />
                        {label}
                      </dt>
                      <dd className="flex h-6 items-center ps-6">
                        <LoadingBlock className={`h-3.5 max-w-full ${width}`} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
              <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 @min-[42rem]/profile-form:grid-cols-2">
                <section className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
                  <h2 className="text-lg font-bold">علاقه‌مندی‌ها</h2>
                  <div className="flex min-w-0 flex-1 flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                      {["w-24", "w-20", "w-24", "w-16", "w-20", "w-16"].map((width, index) => (
                        <LoadingBlock key={index} className={`h-9 max-w-full rounded-lg border ${width}`} />
                      ))}
                    </div>
                    <LoadingBlock className="min-h-28 w-full flex-1 rounded-lg border bg-muted/50" />
                    <LoadingBlock className="mt-auto h-11 w-full shrink-0 rounded-lg bg-(--base-green)/20" />
                  </div>
                </section>
                <section className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
                  <h2 className="text-lg font-bold">تغییر رمز عبور</h2>
                  <div className="flex flex-1 flex-col gap-4">
                    {passwordFields.map((label) => (
                      <div key={label} className="grid gap-2">
                        <p className="text-sm leading-none font-medium">{label}</p>
                        <div className="relative">
                          <LoadingBlock className="h-11 w-full rounded-lg border bg-muted/50 dark:border-input" />
                          <EyeIcon className="absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                    <LoadingBlock className="mt-auto h-11 w-full shrink-0 rounded-lg bg-(--base-green)/20" />
                  </div>
                </section>
              </div>
            </div>
            <aside className="grid min-w-0 gap-3 @min-[40rem]/profile:grid-cols-3 @min-[59rem]/profile:grid-cols-1">
              <StatisticsSkeleton title="یک ماه اخیر" />
              <StatisticsSkeleton title="کل سفارش‌ها" />
              <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
                <h2 className="text-sm font-bold">بازخوردها</h2>
                <div className="flex h-7 items-center gap-2">
                  <MessageSquareIcon className="size-5 text-green-700 dark:text-(--base-green)" />
                  <LoadingBlock className="h-4 w-6" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

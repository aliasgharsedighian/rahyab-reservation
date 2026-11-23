"use client";

import { BanknoteIcon, MessageSquareIcon, PaletteIcon, UtensilsIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { logProfileViewed } from "@/lib/auth-analytics";
import ProfileForm from "./ProfileForm";
import DashboardThemeToggle from "../../components/DashboardThemeToggle";
import PushNotificationControl from "../../notifications/components/PushNotificationControl";
import type { FoodPreferences, Profile } from "../types";

interface ClientProfilePageProps {
  profile: Profile;
  analyticsUserId: string | null;
  foodPreferences: FoodPreferences[];
}

function ProfileStatistics({ title, count, paid }: { title: string; count: number; paid: number }) {
  return (
    <section aria-label={title} className="space-y-4 rounded-2xl border bg-card p-4">
      <h2 className="text-sm font-bold">{title}</h2>
      <dl className="grid grid-cols-2">
        <div className="min-w-0 space-y-2 border-e px-2 text-center">
          <dt className="space-y-2 text-xs text-muted-foreground">
            <UtensilsIcon className="mx-auto size-5 text-green-700 dark:text-(--base-green)" aria-hidden="true" />
            <span className="block">تعداد سفارش</span>
          </dt>
          <dd className="font-bold tabular-nums">{count.toLocaleString("fa-IR")}</dd>
        </div>
        <div className="min-w-0 space-y-2 px-2 text-center">
          <dt className="space-y-2 text-xs text-muted-foreground">
            <BanknoteIcon className="mx-auto size-5 text-green-700 dark:text-(--base-green)" aria-hidden="true" />
            <span className="block">مبلغ پرداختی</span>
          </dt>
          <dd className="font-bold wrap-anywhere tabular-nums">
            {paid.toLocaleString("fa-IR")} <span className="text-xs font-normal text-muted-foreground">تومان</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default function ClientProfilePage({ profile, foodPreferences, analyticsUserId }: ClientProfilePageProps) {
  const reported = useRef(false);
  useEffect(() => {
    if (reported.current) return;
    reported.current = true;
    logProfileViewed(analyticsUserId);
  }, [analyticsUserId]);

  return (
    <div className="@container/profile mx-auto w-full max-w-7xl min-w-0 space-y-5 px-3 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">پروفایل کاربری</h1>
        <p className="text-sm leading-6 text-muted-foreground">اطلاعات حساب و تنظیمات خود را مدیریت کنید.</p>
      </header>
      <div className="grid gap-3 @min-[54rem]/profile:grid-flow-col @min-[54rem]/profile:auto-cols-fr">
        <PushNotificationControl />
        <section aria-labelledby="profile-theme-title" className="flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 sm:gap-4 sm:p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
            <PaletteIcon className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 grow space-y-1">
            <h2 id="profile-theme-title" className="text-sm font-bold">ظاهر برنامه</h2>
            <p className="text-xs leading-6 text-muted-foreground sm:text-sm">
              <span className="dark:hidden">حالت فعلی روشن است.</span>
              <span className="hidden dark:inline">حالت فعلی تیره است.</span>
            </p>
          </div>
          <DashboardThemeToggle showLabel />
        </section>
      </div>
      <div className="grid min-w-0 items-start gap-4 @min-[59rem]/profile:grid-cols-[minmax(0,1fr)_16rem]">
        <ProfileForm profile={profile} foodPreferences={foodPreferences} />
        <aside aria-label="آمار حساب کاربری" className="grid min-w-0 gap-3 @min-[40rem]/profile:grid-cols-3 @min-[59rem]/profile:grid-cols-1">
          <ProfileStatistics title="یک ماه اخیر" count={profile.servings_ordered_last_month} paid={profile.reserved_total_paid_last_month} />
          <ProfileStatistics title="کل سفارش‌ها" count={profile.servings_ordered_total} paid={profile.reserved_total_paid_total} />
          <section className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-4">
            <h2 className="text-sm font-bold">بازخوردها</h2>
            <p className="flex items-center gap-2 text-lg font-bold tabular-nums">
              <MessageSquareIcon className="size-5 text-green-700 dark:text-(--base-green)" aria-hidden="true" />
              {profile.reservation_feedbacks_count.toLocaleString("fa-IR")}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

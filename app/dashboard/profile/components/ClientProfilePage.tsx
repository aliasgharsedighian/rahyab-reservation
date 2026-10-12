"use client";

import { BanknoteIcon, MessageSquareIcon, UtensilsIcon } from "lucide-react";
import ProfileForm from "./ProfileForm";
import type { FoodPreferences, Profile } from "../types";

interface ClientProfilePageProps {
  profile: Profile;
  foodPreferences: FoodPreferences[];
  revalidateData: () => void | Promise<void>;
}

function ProfileStatistics({ title, count, paid }: { title: string; count: number; paid: number }) {
  return (
    <section aria-label={title} className="space-y-5 rounded-xl border bg-card p-4 sm:p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <dl className="grid grid-cols-2">
        <div className="min-w-0 space-y-2 border-l px-2 text-center">
          <UtensilsIcon className="mx-auto size-6 text-(--base-green)" aria-hidden="true" />
          <dt className="text-xs text-(--secondary-text) sm:text-sm">تعداد سفارش</dt>
          <dd className="break-words font-bold">{count.toLocaleString("fa-IR")}</dd>
        </div>
        <div className="min-w-0 space-y-2 px-2 text-center">
          <BanknoteIcon className="mx-auto size-6 text-(--base-green)" aria-hidden="true" />
          <dt className="text-xs text-(--secondary-text) sm:text-sm">مبلغ پرداختی</dt>
          <dd className="break-words font-bold">{paid.toLocaleString("fa-IR")} تومان</dd>
        </div>
      </dl>
    </section>
  );
}

export default function ClientProfilePage({ profile, foodPreferences }: ClientProfilePageProps) {
  return (
    <div className="mx-2 min-w-0 md:mx-6">
      <div className="w-full space-y-4">
        <header className="mb-6 space-y-2">
          <h1 className="text-2xl font-bold sm:text-3xl">پروفایل کاربری</h1>
          <p className="text-sm leading-7 text-(--secondary-text)">اطلاعات حساب کاربری خود را مدیریت کنید.</p>
        </header>
        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_18rem]">
          <ProfileForm profile={profile} foodPreferences={foodPreferences} />
          <aside aria-label="آمار حساب کاربری" className="min-w-0 space-y-4">
        <ProfileStatistics title="یک ماه اخیر" count={profile.servings_ordered_last_month} paid={profile.reserved_total_paid_last_month} />
        <ProfileStatistics title="کلی" count={profile.servings_ordered_total} paid={profile.reserved_total_paid_total} />
        <section aria-label="بازخوردها" className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 sm:p-5">
          <h2 className="text-lg font-bold">بازخوردها</h2>
          <p className="flex items-center gap-3 text-xl font-bold"><MessageSquareIcon className="size-6 text-(--base-green)" aria-hidden="true" />{profile.reservation_feedbacks_count.toLocaleString("fa-IR")}</p>
        </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

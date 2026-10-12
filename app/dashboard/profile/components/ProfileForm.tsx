"use client";

import { apiClient } from "@/lib/api/client";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Building2Icon, CameraIcon, IdCardIcon, KeyRoundIcon, Loader2, MailIcon, PhoneCallIcon } from "lucide-react";
import IntrestProfile from "./IntrestProfile";
import type { FoodPreferences, Profile, ProfileFormValues, ProfileMutationResponse } from "../types";

export default function ProfileForm({ profile, foodPreferences }: { profile: Profile; foodPreferences: FoodPreferences[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(profile.avatar_url);
  const form = useForm<ProfileFormValues>({
    defaultValues: { ...profile, description: profile.description ?? "", current_password: "", password: "", password_confirmation: "" },
  });

  const uploadAvatar = async (selectedFile: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("avatar_url", selectedFile);
      const { data: response, status } = await apiClient.post<ProfileMutationResponse>("profile", formData);
      if (status >= 200 && status < 300) toast.success(response.message);
      else toast.error(response.message || "خطا در آپلود تصویر");
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
      console.error(error);
    } finally { setIsUploading(false); }
  };

  const onSubmitChangePassword = async (values: ProfileFormValues) => {
    const formData = new FormData();
    formData.append("current_password", values.current_password);
    formData.append("password", values.password);
    formData.append("password_confirmation", values.password_confirmation);
    const { data: response, status } = await apiClient.post<ProfileMutationResponse>("profile/change-password", formData);
    if (status === 200) toast.success(response.message);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setPreview(URL.createObjectURL(selected));
    await uploadAvatar(selected);
  };

  const personalFields = [
    ["نام", profile.name], ["نام خانوادگی", profile.family],
    ["موبایل", profile.mobile], ["ایمیل", profile.email || "ثبت نشده"],
    ["کد پرسنلی", profile.employee_code], ["شرکت", profile.company_name],
    ["دپارتمان", profile.departeman_name], ["دسترسی", profile.is_admin ? "ادمین" : "کاربر عادی"],
  ] as const;

  return (
    <div className="@container/profile-form min-w-0 space-y-4" dir="rtl">
      <section aria-label="خلاصه حساب کاربری" className="flex min-w-0 items-start gap-4 rounded-xl border bg-card p-4 sm:items-center sm:p-5">
        <div className="relative shrink-0">
          <button type="button" aria-label="تغییر تصویر پروفایل" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="relative block size-20 overflow-hidden rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--base-green) disabled:opacity-50 sm:size-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview || profile.avatar_url || "/assets/images/blank-profile.webp"} alt={"تصویر پروفایل " + profile.name} className="size-full object-cover" />
            {isUploading && <span className="absolute inset-0 flex items-center justify-center bg-black/30"><Loader2 className="size-7 animate-spin text-white" aria-hidden="true" /></span>}
          </button>
          <Button type="button" variant="outline" size="icon" aria-label="انتخاب عکس پروفایل" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -left-1 rounded-full border-(--base-green) bg-card text-(--base-green)"><CameraIcon className="size-4" /></Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" aria-label="فایل تصویر پروفایل" onChange={handleAvatarChange} />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="break-words text-lg font-bold leading-7 sm:text-xl">{profile.name} {profile.family}</h2>
          <div className="space-y-1.5 text-xs leading-6 text-(--secondary-text) sm:text-sm">
            <p className="flex items-start gap-2"><Building2Icon className="mt-1 size-4 shrink-0" aria-hidden="true" /><span className="wrap-anywhere">{profile.departeman_name} - {profile.company_name}</span></p>
            <p className="flex items-start gap-2"><PhoneCallIcon className="mt-1 size-4 shrink-0" aria-hidden="true" /><bdi dir="ltr">{profile.mobile}</bdi></p>
            <p className="flex items-start gap-2"><MailIcon className="mt-1 size-4 shrink-0" aria-hidden="true" /><span className="wrap-anywhere">{profile.email || "ثبت نشده"}</span></p>
            <p className="flex items-start gap-2"><IdCardIcon className="mt-1 size-4 shrink-0" aria-hidden="true" /><span className="wrap-anywhere">کد پرسنلی: {profile.employee_code}</span></p>
          </div>
        </div>
      </section>
      <section aria-labelledby="personal-information-title" className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
        <h2 id="personal-information-title" className="text-lg font-bold">اطلاعات شخصی</h2>
        <div className="grid min-w-0 grid-cols-1 gap-4 @min-[30rem]/profile-form:grid-cols-2">
          {personalFields.map(([label, value], index) => (
            <div key={label} className="min-w-0 space-y-2">
              <label htmlFor={"profile-info-" + index} className="block text-sm font-medium">{label}</label>
              <Input id={"profile-info-" + index} value={value} disabled className="h-11 rounded-lg bg-muted/50 disabled:opacity-100" />
            </div>
          ))}
        </div>
      </section>
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 @min-[42rem]/profile-form:grid-cols-2">
        <section aria-labelledby="food-preferences-title" className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
          <h2 id="food-preferences-title" className="text-lg font-bold">علاقه‌مندی‌ها</h2>
          <IntrestProfile form={form} foodPreferences={foodPreferences} userFoodPreferences={profile.food_preferences} />
        </section>
        <section aria-labelledby="change-password-title" className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
          <h2 id="change-password-title" className="text-lg font-bold">تغییر رمز عبور</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitChangePassword)} className="flex flex-1 flex-col gap-4">
              {([
                ["current_password", "رمز عبور فعلی", "رمز عبور فعلی را وارد کنید", "current-password"],
                ["password", "رمز عبور جدید", "رمز عبور جدید را وارد کنید", "new-password"],
                ["password_confirmation", "تکرار رمز عبور جدید", "رمز عبور جدید را دوباره وارد کنید", "new-password"],
              ] as const).map(([name, label, placeholder, autoComplete]) => (
                <FormField key={name} control={form.control} name={name} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl><PasswordInput {...field} autoComplete={autoComplete} placeholder={placeholder} className="h-11 rounded-lg bg-muted/50 text-sm" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
              <Button type="submit" className="mt-auto h-11 w-full shrink-0 gap-2 rounded-lg bg-(--base-green) text-white hover:bg-(--base-green)/90 dark:text-zinc-950"><KeyRoundIcon className="size-4" aria-hidden="true" />تغییر رمز عبور</Button>
            </form>
          </Form>
        </section>
      </div>
    </div>
  );
}

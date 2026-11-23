"use client";

import { apiClient } from "@/lib/api/client";
import { updateUserAvatar } from "@/redux/features/auth-slice";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Building2Icon, CameraIcon, IdCardIcon, KeyRoundIcon, LayersIcon, Loader2, MailIcon, PhoneCallIcon, ShieldCheckIcon } from "lucide-react";
import IntrestProfile from "./IntrestProfile";
import type { FoodPreferences, Profile, ProfileFormValues, ProfileMutationResponse, ProfileResponse } from "../types";

export default function ProfileForm({ profile, foodPreferences }: { profile: Profile; foodPreferences: FoodPreferences[] }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInProgress = useRef(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const form = useForm<ProfileFormValues>({
    defaultValues: { ...profile, description: profile.description ?? "", current_password: "", password: "", password_confirmation: "" },
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file || uploadInProgress.current) return;

    e.currentTarget.value = "";
    const previewUrl = URL.createObjectURL(file);
    uploadInProgress.current = true;
    setIsUploading(true);
    setPreview(previewUrl);

    try {
      const formData = new FormData();
      formData.append("avatar_url", file);
      const { data: response, status } = await apiClient.post<ProfileMutationResponse>("profile", formData);
      const responseStatus = Number(response?.status ?? status);
      if (status < 200 || status >= 300 || responseStatus < 200 || responseStatus >= 300 || response?.success === false) {
        toast.error(response?.message || "خطا در آپلود تصویر");
        return;
      }

      let avatarUrl = response?.data?.avatar_url;
      if (!avatarUrl) {
        // Some successful upload responses only contain a message.
        const updatedProfile = await apiClient.get<ProfileResponse>("profile").catch(() => null);
        if (updatedProfile?.status === 200 && (updatedProfile.data?.status ?? 200) === 200) {
          avatarUrl = updatedProfile.data?.data?.avatar_url;
        }
      }

      if (!avatarUrl) {
        toast.warning("تصویر ذخیره شد، اما نمایش آن به‌روز نشد.");
        return;
      }

      dispatch(updateUserAvatar(avatarUrl));
      setUploadedAvatar(avatarUrl);
      toast.success(response?.message || "تصویر پروفایل به‌روز شد.");
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
      console.error(error);
    } finally {
      URL.revokeObjectURL(previewUrl);
      uploadInProgress.current = false;
      setPreview(null);
      setIsUploading(false);
    }
  };

  const onSubmitChangePassword = async (values: ProfileFormValues) => {
    const formData = new FormData();
    formData.append("current_password", values.current_password);
    formData.append("password", values.password);
    formData.append("password_confirmation", values.password_confirmation);
    const { data: response, status } = await apiClient.post<ProfileMutationResponse>("profile/change-password", formData);
    if (status === 200) toast.success(response.message);
  };

  const accountFields = [
    ["شرکت", profile.company_name, Building2Icon],
    ["دپارتمان", profile.departeman_name, LayersIcon],
    ["کد پرسنلی", profile.employee_code, IdCardIcon, "ltr"],
    ["دسترسی", profile.is_admin ? "ادمین" : "کاربر عادی", ShieldCheckIcon],
    ["موبایل", profile.mobile, PhoneCallIcon, "ltr"],
    ["ایمیل", profile.email, MailIcon],
  ] as const;

  // Retained with the original personal information section for possible reuse.
  /*
  const personalFields = [
    ["نام", profile.name], ["نام خانوادگی", profile.family],
    ["موبایل", profile.mobile], ["ایمیل", profile.email || "ثبت نشده"],
    ["کد پرسنلی", profile.employee_code], ["شرکت", profile.company_name],
    ["دپارتمان", profile.departeman_name], ["دسترسی", profile.is_admin ? "ادمین" : "کاربر عادی"],
  ] as const;
  */

  return (
    <div className="@container/profile-form min-w-0 space-y-4" dir="rtl">
      <section aria-labelledby="profile-name" className="min-w-0 overflow-hidden rounded-2xl border bg-card">
        <div className="flex min-w-0 items-center gap-4 border-b bg-linear-to-l from-(--light-green) to-card p-4 sm:gap-5 sm:p-6">
          <button
            type="button"
            aria-label="تغییر تصویر پروفایل"
            aria-busy={isUploading}
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="group relative size-16 shrink-0 cursor-pointer rounded-full border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--base-green) disabled:cursor-wait sm:size-20"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview || uploadedAvatar || profile.avatar_url || "/assets/images/blank-profile.webp"} alt="" className="size-full rounded-full object-cover" />
            <span className="absolute -bottom-1 -left-1 grid size-7 place-items-center rounded-full border bg-card text-green-700 shadow-sm group-hover:bg-(--light-green) dark:text-(--base-green)">
              {isUploading
                ? <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />
                : <CameraIcon className="size-4" aria-hidden="true" />}
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" aria-label="فایل تصویر پروفایل" onChange={handleAvatarChange} />
          <h2 id="profile-name" className="min-w-0 text-lg font-bold leading-relaxed wrap-anywhere sm:text-2xl">{profile.name} {profile.family}</h2>
        </div>
        <dl className="grid gap-4 px-4 py-5 @min-[24rem]/profile-form:grid-cols-2 @min-[38rem]/profile-form:grid-cols-3 sm:px-6">
          {accountFields.map(([label, value, Icon, dir]) => (
            <div key={label} className="min-w-0 space-y-1">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="size-4 shrink-0 text-green-700 dark:text-(--base-green)" aria-hidden="true" />
                {label}
              </dt>
              <dd className="ps-6 text-sm leading-6 wrap-anywhere">
                <bdi dir={value ? dir : "auto"}>{value || "ثبت نشده"}</bdi>
              </dd>
            </div>
          ))}
        </dl>
      </section>
      {/* <section aria-labelledby="personal-information-title" className="space-y-4 rounded-xl border bg-card p-4 sm:p-5">
        <h2 id="personal-information-title" className="text-lg font-bold">اطلاعات شخصی</h2>
        <div className="grid min-w-0 grid-cols-1 gap-4 @min-[30rem]/profile-form:grid-cols-2">
          {personalFields.map(([label, value], index) => (
            <div key={label} className="min-w-0 space-y-2">
              <label htmlFor={"profile-info-" + index} className="block text-sm font-medium">{label}</label>
              <Input id={"profile-info-" + index} value={value} disabled className="h-11 rounded-lg bg-muted/50 disabled:opacity-100" />
            </div>
          ))}
        </div>
      </section> */}
      <div className="grid min-w-0 grid-cols-1 items-stretch gap-4 @min-[42rem]/profile-form:grid-cols-2">
        <section aria-labelledby="food-preferences-title" className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
          <h2 id="food-preferences-title" className="text-lg font-bold">علاقه‌مندی‌ها</h2>
          <IntrestProfile form={form} foodPreferences={foodPreferences} userFoodPreferences={profile.food_preferences} />
        </section>
        <section aria-labelledby="change-password-title" className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-card p-4 sm:p-5">
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

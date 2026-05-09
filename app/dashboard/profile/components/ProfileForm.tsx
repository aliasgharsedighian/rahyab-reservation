"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  PhoneCallIcon,
  LetterTextIcon,
  User2Icon,
  Edit2,
  CameraIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Profile = {
  id: number;
  name: string;
  family: string;
  mobile: string;
  email: string;
  employee_code: string;
  company_name: string;
  departeman_name: string;
  wallet_balance: number;
  avatar_url: string | null;
  is_admin: boolean;
  current_password: string;
  password: string;
  password_confirmation: string;
  description: string;
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const fileInputRef = useRef<any>(null);
  const [activeEdit, setActiveEdit] = useState(false);
  const [preview, setPreview] = useState<string | null>(profile.avatar_url);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<Profile>({
    defaultValues: profile,
  });

  const onSubmit = async (data: Profile) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    var myHeaders = new Headers();

    myHeaders.append("Accept", "*/*");
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    formData.append("name", data.name);
    formData.append("family", data.family);

    if (file) {
      formData.append("avatar_url", file);
    }

    // console.log("Submitting:", data);

    // مثال API
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ADDRESS}profile`, {
      method: "POST",
      body: formData,
      headers: myHeaders,
    });

    const response = await res.json();

    if (res.status === 200) {
      toast.success(response.message);
    }
  };

  const onSubmitChangePassword = async (values: Profile) => {
    const current_password = values.current_password;
    const password = values.password;
    const password_confirmation = values.password_confirmation;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    formData.append("current_password", current_password);
    formData.append("password", password);
    formData.append("password_confirmation", password_confirmation);

    // مثال API
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ADDRESS}profile/change-password`,
      {
        method: "POST",
        body: formData,
        headers: myHeaders,
      },
    );

    const response = await res.json();

    if (res.status === 200) {
      toast.success(response.message);
    }
  };

  const onSubmitInterests = async (values: Profile) => {
    const description = values.current_password;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    formData.append("description", description);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ADDRESS}profile`, {
      method: "POST",
      body: formData,
      headers: myHeaders,
    });

    const response = await res.json();

    if (res.status === 200) {
      toast.success(response.message);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    const previewUrl = URL.createObjectURL(selected);
    setPreview(previewUrl);
  };

  return (
    <div className="w-full  flex flex-col max-w-2xl gap-6" dir="rtl">
      <div className="w-full flex border justify-between gap-4 p-4 rounded-xl">
        {/* Avatar Section */}

        <div className="w-full flex flex-col gap-3 items-start justify-center">
          <div className="flex items-center gap-2">
            <p className="iranSansBold text-xl">
              {profile.name} {profile.family}
            </p>
          </div>
          <div className="text-(--secondary-text) flex flex-col gap-3 items-start justify-center text-sm">
            <div className="flex items-center gap-2">
              <PhoneCallIcon className="size-4" />
              <p>
                {profile.departeman_name} - {profile.company_name}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCallIcon className="size-4" />
                <p>شماره موبایل : </p>
              </div>
              <p> {profile.mobile}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LetterTextIcon className="size-4" />
                <p>ایمیل</p>
              </div>
              <p>{profile.mobile}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User2Icon className="size-4" />
                <p>کد پرسنلی</p>
              </div>
              <p>{profile.employee_code}</p>
            </div>
          </div>
        </div>
        <div className="w-full flex items-start justify-between">
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-col items-center justify-center relative w-30 h-30">
              <img
                src={preview || profile.avatar_url || ""}
                alt="avatar"
                // fill
                className="rounded-full object-cover border h-36 w-36"
                onClick={() => fileInputRef.current.click()}
              />
              <div className="bg-white absolute -bottom-1 -right-1 p-2 border border-(--base-green) rounded-full">
                <CameraIcon className="text-(--base-green)" />
              </div>
            </div>

            {/* <label className="cursor-pointer text-sm text-blue-600"> */}
            {/* تغییر تصویر */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {/* </label> */}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full border p-4 rounded-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-row items-center justify-between w-full">
              <h2 className="text-lg iranSansBold">اطلاعات شخصی</h2>
              <Button
                variant="outline"
                type="submit"
                size={"lg"}
                className="flex justify-between px-12 text-(--base-green) border-(--base-green)"
              >
                <Edit2 />
                ویرایش اطلاعات
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between w-full">
                {/* Name (editable) */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>نام</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Family (editable) */}
                <FormField
                  control={form.control}
                  name="family"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>نام خانوادگی</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Disabled fields */}
              <div className="flex flex-col md:flex-row gap-4 justify-between w-full">
                <FormItem className="w-full">
                  <FormLabel>موبایل</FormLabel>
                  <Input value={profile.mobile} disabled />
                </FormItem>

                <FormItem className="w-full">
                  <FormLabel>ایمیل</FormLabel>
                  <Input value={profile.email} disabled />
                </FormItem>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-between w-full">
                <FormItem className="w-full">
                  <FormLabel>کد پرسنلی</FormLabel>
                  <Input value={profile.employee_code} disabled />
                </FormItem>

                <FormItem className="w-full">
                  <FormLabel>شرکت</FormLabel>
                  <Input value={profile.company_name} disabled />
                </FormItem>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-between w-full">
                <FormItem className="w-full">
                  <FormLabel>دپارتمان</FormLabel>
                  <Input value={profile.departeman_name} disabled />
                </FormItem>

                <FormItem className="w-full">
                  <FormLabel>دسترسی</FormLabel>
                  <Input
                    value={profile.is_admin ? "ادمین" : "کاربر عادی"}
                    disabled
                  />
                </FormItem>
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between w-full"></div>
            </div>
          </form>
        </Form>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="w-full md:w-1/2 space-y-4 flex flex-col border p-4 rounded-xl">
          <h2 className="text-lg iranSansBold">تغییر رمز عبور</h2>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitChangePassword)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Current Password</FormLabel> */}
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="رمز عبور فعلی"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>New Password</FormLabel> */}
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="رمز عبور جدید"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Confirm New Password</FormLabel> */}
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="تکرار رمز عبور جدید"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                تغییر رمز عبور
              </Button>
            </form>
          </Form>
        </div>

        <div className="w-full md:w-1/2 space-y-4 flex flex-col border p-4 rounded-xl">
          <h2 className="text-lg iranSansBold">علاقه‌مندی‌ها</h2>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmitInterests)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="علاقه‌مندی‌های خود را بنویسید..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                ثبت علاقه‌مندی‌ها
              </Button>
            </form>
          </Form>
        </div>
      </div>

      {/* <div className="flex flex-col justify-center items-center gap-4 border rounded-xl p-4">
        <span>اعتبار کیف پول</span>
        <span>{profile.wallet_balance.toLocaleString()} تومان</span>
      </div> */}
    </div>
  );
}

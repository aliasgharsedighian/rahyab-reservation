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
};

export default function ProfileForm({ profile }: { profile: Profile }) {
  const fileInputRef = useRef<any>(null);
  const [preview, setPreview] = useState<string | null>(profile.avatar_url);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<Profile>({
    defaultValues: profile,
  });

  const onSubmit = async (data: Profile) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    formData.append("name", data.name);
    formData.append("family", data.family);

    if (file) {
      formData.append("avatar", file);
    }

    console.log("Submitting:", data);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    const previewUrl = URL.createObjectURL(selected);
    setPreview(previewUrl);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6" dir="rtl">
      <h2 className="text-xl font-bold">پروفایل کاربر</h2>

      <Card>
        <CardHeader>
          <CardTitle>
            {/* Avatar Section */}
            <div className="flex flex-col items-start gap-3">
              <div className="flex flex-col items-center justify-center relative w-24 h-24">
                <Image
                  src={preview || "/default-avatar.png"}
                  alt="avatar"
                  fill
                  className="rounded-full object-cover border"
                  onClick={() => fileInputRef.current.click()}
                />
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <div className="mt-6 flex flex-col md:flex-row gap-4 justify-between w-full">
                <Button type="submit" size={"lg"} className="w-full basis-1/2">
                  ذخیره تغییرات
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col justify-center items-center gap-4 border rounded-xl p-4">
            <span>اعتبار کیف پول</span>
            <span>{profile.wallet_balance.toLocaleString()} تومان</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

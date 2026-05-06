"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useDetectMobile from "@/app/components/hooks/DetectMobile";
import ProfileForm from "./ProfileForm";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logOut } from "@/redux/features/auth-slice";
import { toast } from "sonner";
import logoutCookiesAction from "@/actions/logoutCookiesAction";

function ClientProfilePage({ profile, revalidateData }: any) {
  const isMobile = useDetectMobile();
  const dispatch = useDispatch();
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogoutUser = () => {
    const token = localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    startTransition(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_ADDRESS}auth/logout`,
          {
            method: "POST",
            headers: myHeaders,
            credentials: "include",
          },
        );
        const result = await res.json();
        if (result.status === 200) {
          localStorage.removeItem("token");
          dispatch(logOut());
          logoutCookiesAction();
          push("/");
          toast.success(result.message);
        } else {
          localStorage.removeItem("token");
          dispatch(logOut());
          push("/");
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="mb-6 flex flex-col gap-3 mr-4">
        <h2 className="text-2xl font-bold">پروفایل کاربری</h2>
        <p className="text-(--secondary-text)">
          اطلاعات حساب کاربری خود را مدیریت کنید.
        </p>
      </div>
      <div className="flex gap-6 w-full">
        <div className="md:basis-8/12  w-full mr-4">
          <ProfileForm profile={profile} />
        </div>
        <div className="hidden md:flex md:basis-4/12 md:ml-6">
          <div className="flex flex-col gap-4 w-full">
            {/* کارت یک ماه اخیر */}
            <Card className="rounded-2xl shadow-md h-fit">
              <CardHeader>
                <CardTitle className="text-base iranSansBold">
                  یک ماه اخیر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>تعداد سفارش</span>
                  <span className="font-bold">
                    {profile.servings_ordered_last_month}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>مبلغ پرداختی</span>
                  <span className="font-bold">
                    {profile.reserved_total_paid_last_month.toLocaleString()}{" "}
                    تومان
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* کارت کلی */}
            <Card className="rounded-2xl shadow-md h-fit">
              <CardHeader>
                <CardTitle className="text-base iranSansBold">کلی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>تعداد سفارش</span>
                  <span className="font-bold">
                    {profile.servings_ordered_total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>مبلغ پرداختی</span>
                  <span className="font-bold">
                    {profile.reserved_total_paid_total.toLocaleString()} تومان
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* کارت بازخورد */}
            <Card className="rounded-2xl shadow-md h-fit">
              <CardHeader>
                <CardTitle className="text-base iranSansBold">
                  بازخوردها
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <span className="text-3xl font-bold">
                  {profile.reservation_feedbacks_count}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientProfilePage;

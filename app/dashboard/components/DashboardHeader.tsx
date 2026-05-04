"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";

function DashboardHeader({ title }: any) {
  //   const userInfo = useSelector(userInfoAccess);
  const token = localStorage.getItem("token");

  const { push } = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [openProfilePop, setOpenProfilePop] = useState(false);
  //   const hiddenSidebar = useSelector(hiddenSidebarReducer);

  const getProfileDetail = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(`${process.env.API_ADDRESS}profile`, {
        method: "GET",
        headers: myHeaders,
      });
      const result = await response.json();
      console.log(result);
      if (result.status === 200) {
        // dispatch(changeUserInfo(result.data));
      } else {
        // dispatch(logOut());
        localStorage.removeItem("token");
        // logoutAction(token);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getProfileDetail();
  }, []);

  // if (!isAuth) {
  //   redirect("/login");
  // }

  return (
    <div className="bg-[#e9e9e9] py-[18px] px-4 md:px-6 flex justify-between items-center shadow-md text-sm md:text-base sticky top-0 z-50">
      <div className="flex items-start gap-3">
        <SidebarTrigger className="flex md:hidden sticky top-9 " />

        <h2 className="text-xl">{title}</h2>
      </div>
      <div className="flex items-center gap-6">
        <Popover>
          <PopoverTrigger className="hidden md:flex">
            <div className="border-l border-gray-600 pl-6 cursor-pointer hover:text-[var(--yellow)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 m-0 rounded-md">
            <div className="rounded-md">
              <div className="bg-gray-600 text-white text-sm p-2 rounded-t-md">
                <p>اعلان‌ها و پیام‌ها</p>
              </div>
              <div className="p-4 text-sm border-b">
                <p>نوتفیکیشن وب شما غیر فعال است.برای فعال سازی کلیک کنید.</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 cursor-pointer"
        >
          <span className="text-sm font-IRANSansBold hidden sm:flex">
            {/* {!userInfo?.name || !userInfo?.family
                  ? "پروفایل کاربر"
                  : ` ${userInfo.name} ${userInfo.family}`} */}
          </span>
          <Avatar>
            <AvatarImage src="/assets/images/icons/blank-profile.webp" />

            <AvatarFallback>
              {/* {userInfo?.name.charAt(0)} {userInfo?.family.charAt(0)} */}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </div>
  );
}

export default DashboardHeader;

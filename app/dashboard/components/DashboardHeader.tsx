"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { userInfoAccess } from "@/redux/features/auth-slice";
import logoutCookiesAction from "@/actions/logoutCookiesAction";
import { Button } from "@/components/ui/button";
import { BellIcon } from "lucide-react";

function DashboardHeader({ title }: any) {
  //   const userInfo = useSelector(userInfoAccess);
  const token = localStorage.getItem("token");

  const { push } = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();

  const userInfoRedux: any = useSelector(userInfoAccess);

  const [openProfilePop, setOpenProfilePop] = useState(false);
  const [notificationsData, setNotificationsData] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  //   const hiddenSidebar = useSelector(hiddenSidebarReducer);

  const handleOpenNotif = (item: any) => {
    setSelectedNotif(item);
    setOpenNotif(true);
  };

  useEffect(() => {
    if (openNotif && selectedNotif) {
      markSeenNotification();
    }
  }, [openNotif, selectedNotif]);

  const getProfileDetail = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}profile`,
        {
          method: "GET",
          headers: myHeaders,
        },
      );
      const result = await response.json();
      // console.log(result);
      if (result.status === 200) {
        // dispatch(changeUserInfo(result.data));
      } else {
        // dispatch(logOut());
        localStorage.removeItem("token");
        logoutCookiesAction();
        // logoutAction(token);
      }
    } catch (error) {}
  };

  const getNotifications = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}notifications?count=5&page=1&seen=false`,
        {
          method: "GET",
          headers: myHeaders,
        },
      );
      const result = await response.json();
      // console.log(result);
      if (result.status === 200) {
        setNotificationsData(result.data.notifications);
        // dispatch(changeUserInfo(result.data));
      } else {
        // dispatch(logOut());
        localStorage.removeItem("token");
        // logoutAction(token);
      }
    } catch (error) {}
  };

  const markSeenNotification = async () => {
    try {
      var myHeaders = new Headers();
      myHeaders.append("accept", "*/*");
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}notifications/mark-seen`,
        {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({
            notification_id: selectedNotif.id,
          }),
        },
      );
      const result = await response.json();
      // console.log(result);
      if (result.status === 200) {
        getNotifications();
      } else {
        // dispatch(logOut());
        localStorage.removeItem("token");
        // logoutAction(token);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getProfileDetail();
    getNotifications();
  }, []);

  // if (!isAuth) {
  //   redirect("/login");
  // }

  return (
    <>
      <Dialog open={openNotif} onOpenChange={setOpenNotif}>
        <DialogContent className="rtl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">جزئیات اعلان</DialogTitle>
          </DialogHeader>

          {selectedNotif && (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-(--base-black)">
                {selectedNotif.body}
              </p>

              <div className="text-xs text-gray-400">
                {selectedNotif.created_at}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div className="bg-white py-4.5 px-4 md:px-6 flex justify-between items-center shadow-md text-sm md:text-base sticky top-0 z-50">
        <div className="flex items-start gap-3">
          <SidebarTrigger className="flex md:hidden sticky top-9 " />

          <h2 className="text-xl">{title}</h2>
        </div>
        <div className="flex items-center gap-6">
          <Popover>
            <PopoverTrigger className="flex">
              <div className="relative border-l border-gray-400 pl-6 cursor-pointer">
                <BellIcon
                  className="size-5 text-(--base-green)"
                  fill={
                    notificationsData.length === 0
                      ? "none"
                      : "var(--base-green)"
                  }
                />
                {notificationsData.length === 0 ? null : (
                  <span className="absolute -right-1 -top-2 bg-(--base-green) h-4 w-4 flex items-center justify-center rounded-full text-white">
                    {notificationsData.length}
                  </span>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 m-0 rounded-md">
              <div className="rounded-md">
                <div className="bg-(--base-green) text-white text-sm p-2 rounded-t-md">
                  <p>اعلان‌ها و پیام‌ها</p>
                </div>
                <div className="flex flex-col divide-y rounded-xl border overflow-hidden">
                  {notificationsData.length === 0 ? (
                    <div className="flex items-center justify-center w-full">
                      <p className="p-2">پیام خوانده نشده ندارید</p>
                    </div>
                  ) : (
                    notificationsData?.map((item: any) => (
                      <div
                        key={item.id}
                        onClick={() => handleOpenNotif(item)}
                        className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
                      >
                        <div className="flex flex-col flex-1">
                          <p className="text-sm text-(--base-black) line-clamp-1">
                            {item.body}
                          </p>
                          <span className="text-xs text-gray-400">
                            {item.created_at}
                          </span>
                        </div>

                        {/* دات برای unread */}
                        {!item.seen ? (
                          <span className="p-2 text-[11px] bg-(--light-green) text-(--base-green) rounded-md">
                            خوانده نشده
                          </span>
                        ) : null}
                      </div>
                    ))
                  )}

                  <Button variant="link" asChild>
                    <Link
                      href="/dashboard/notifications?page=1"
                      className="p-2 flex items-center justify-center text-blue-600!"
                    >
                      مشاهده همه
                    </Link>
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold hidden sm:flex">
                {!userInfoRedux?.name || !userInfoRedux?.family
                  ? "پروفایل کاربر"
                  : ` ${userInfoRedux.name} ${userInfoRedux.family}`}
              </span>
              <span className="text-[11px] text-(--secondary-text) hidden sm:flex">
                {!userInfoRedux?.departeman_name || !userInfoRedux?.company_name
                  ? "پروفایل کاربر"
                  : ` ${userInfoRedux.departeman_name} ${userInfoRedux.company_name}`}
              </span>
            </div>
            <Avatar>
              <AvatarImage
                src={
                  userInfoRedux.avatar_url
                    ? userInfoRedux.avatar_url
                    : "/assets/images/blank-profile.webp"
                }
              />

              <AvatarFallback>
                {userInfoRedux?.name?.charAt(0)}{" "}
                {userInfoRedux?.family?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </>
  );
}

export default DashboardHeader;

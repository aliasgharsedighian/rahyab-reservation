"use client";

import { apiClient } from "@/lib/api/client";

import { useCallback, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationBell from "../notifications/components/NotificationBell";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { logIn, userInfoAccess } from "@/redux/features/auth-slice";
import DashboardThemeToggle from "./DashboardThemeToggle";
import ForcedPasswordChangeModal from "./ForcedPasswordChangeModal";
import HeaderReserveCart from "./HeaderReserveCart";

function DashboardHeader({
  title,
  stickyHeightVariable,
}: {
  title: string;
  stickyHeightVariable?: `--${string}`;
}) {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    const container = header?.parentElement;
    if (!header || !container || !stickyHeightVariable) return;

    // Let sticky content below this header follow its actual responsive height.
    const updateHeight = () => {
      container.style.setProperty(
        stickyHeightVariable,
        `${header.getBoundingClientRect().height}px`,
      );
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => {
      observer.disconnect();
      container.style.removeProperty(stickyHeightVariable);
    };
  }, [stickyHeightVariable]);

  const dispatch = useDispatch();
  const userInfoRedux = useSelector(userInfoAccess);

  const getProfileDetail = useCallback(async () => {
    try {
      const { data: result, status } = await apiClient.get("profile");
      // console.log(result);
      if (status === 200 && result.status === 200) {
        dispatch(logIn(result.data));
        const passwordChangeIsRequired =
          Number(result.data?.must_change_password) === 1;
        return !passwordChangeIsRequired;
      }
    } catch {}

    return false;
  }, [dispatch]);

  useEffect(() => {
    getProfileDetail();
  }, [getProfileDetail]);

  // if (!isAuth) {
  //   redirect("/login");
  // }

  return (
    <>
      <ForcedPasswordChangeModal
        open={Number(userInfoRedux?.must_change_password) === 1}
        onPasswordChanged={getProfileDetail}
      />
      <div ref={headerRef} className="bg-background py-4.5 px-4 md:px-6 flex justify-between items-center shadow-md border-b border-border text-sm md:text-base sticky top-0 z-50">
        <div className="flex min-w-0 items-start gap-2 sm:gap-3">
          <SidebarTrigger className="flex md:hidden sticky top-9 " />

          <h2 className="whitespace-nowrap text-base sm:text-xl">{title}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-6">
          <HeaderReserveCart />
          <DashboardThemeToggle />

          <NotificationBell />

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

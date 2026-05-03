"use client";

import React, { useState, useTransition } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClockIcon,
  HomeIcon,
  ListIcon,
  LogOutIcon,
  PanelRight,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { logOut } from "@/redux/features/auth-slice";
import logoutCookiesAction from "@/actions/logoutCookiesAction";
import { toast } from "sonner";

const dashboardList = [
  // {
  //   id: 1,
  //   accordion: false,
  //   accordionLinks: [],
  //   text: "خانه",
  //   link: "/dashboard/home",
  //   icon: <HomeIcon className="size-5 text-gray-500" />,
  // },
  {
    id: 2,
    accordion: false,
    accordionLinks: [],
    text: "رزرو غذا",
    link: "/dashboard/reserve",
    icon: <ListIcon className="size-5 text-gray-500" />,
  },
  {
    id: 3,
    accordion: true,
    accordionLinks: [
      {
        id: 1,
        text: "رزروهای گذشته",
        href: "/dashboard/history-reserve?page=1",
      },
      {
        id: 2,
        text: "رزروهای پیش رو",
        href: "/dashboard/upcoming-reserve?page=1",
      },
    ],
    text: "تاریخچه رزروها",
    link: "/dashboard/history-reserve",
    icon: <ClockIcon className="size-5 text-gray-500" />,
  },
  {
    id: 4,
    accordion: false,
    accordionLinks: [],
    text: "کیف پول",
    link: "/dashboard/wallet",
    icon: <WalletIcon className="size-5 text-gray-500" />,
  },
  {
    id: 5,
    accordion: false,
    accordionLinks: [],
    text: "پروفایل کاربری",
    link: "/dashboard/profile",
    icon: <UserIcon className="size-5 text-gray-500" />,
  },
];

function SidebarApp() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const { push } = useRouter();

  const {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  } = useSidebar();

  // const [openDropDown, setOpenDropDown] = useState(false);

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
    <Sidebar className="" side="right" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-2 gap-0 flex flex-row w-full">
        {/* <Link
          href="/dashboard"
          className={` bg-white w-full py-3 items-center ${
            open ? "flex" : "hidden"
          }`}
        >
          
        </Link> */}
        <Button
          className="rounded-none h-full text-black"
          onClick={toggleSidebar}
          variant={"ghost"}
        >
          <PanelRight width={20} height={20} className="w-5 h-5" />
        </Button>
      </SidebarHeader>
      <SidebarContent className="py-3">
        <SidebarMenu className="w-full flex items-center justify-center">
          {dashboardList.map((item) =>
            item.accordion ? (
              !open && !isMobile ? (
                <div
                  onClick={() => {
                    if (!open) {
                      setOpen(true);
                    }
                  }}
                  key={item.id}
                  className={`cursor-pointer hover:text-black ${
                    pathname === item.link
                      ? "text-black font-IRANSansBold"
                      : "text-zinc-700"
                  }`}
                >
                  {item.icon}
                </div>
              ) : (
                <div
                  key={item.id}
                  className={`w-full hover:text-black ${
                    pathname.startsWith(item.link)
                      ? "text-black font-IRANSansBold"
                      : "text-zinc-700"
                  }`}
                >
                  <Accordion
                    orientation="horizontal"
                    type="single"
                    collapsible
                    className="w-full"
                  >
                    <AccordionItem value="acceptors" className="border-none">
                      <AccordionTrigger className="font-IRANSansBold">
                        <SidebarMenuItem className="w-full" key={item.id}>
                          <SidebarMenuButton
                            className="h-full hover:bg-transparent"
                            asChild
                          >
                            <div>
                              {item.icon}
                              <span>{item.text}</span>
                            </div>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </AccordionTrigger>
                      <AccordionContent className="pr-2">
                        <div className="flex flex-col gap-3 pt-2">
                          {item?.accordionLinks.map((item: any) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`hover:black h-8 ${
                                pathname === item.href
                                  ? "text-black"
                                  : "text-zinc-700"
                              }`}
                            >
                              {item.text}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )
            ) : (
              <SidebarMenuItem
                key={item.id}
                className={`w-full h-13.5 hover:text-yellow-600 flex items-center justify-center rounded-md ${
                  pathname === item.link
                    ? "text-black font-IRANSansBold bg-blue-100"
                    : "text-zinc-700"
                }`}
              >
                <SidebarMenuButton className="h-full hover:bg-blue-100" asChild>
                  <Link href={item.link}>
                    {item.icon}
                    <span>{item.text}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>

        {isMobile ? (
          <Button
            className="p-3 items-start justify-start gap-4 h-full text-[var(--main-red)]"
            variant="ghost"
            onClick={handleLogoutUser}
          >
            <LogOutIcon className="size-5" />
            <p>خروج از حساب کاربری</p>
          </Button>
        ) : null}
      </SidebarContent>
    </Sidebar>
  );
}

export default SidebarApp;

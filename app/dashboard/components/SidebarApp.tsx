"use client";

import React, { useState, useTransition } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  ListStart,
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
    href: "/dashboard/reserve",
    icon: <ListIcon className="size-5 text-gray-500" />,
  },
  {
    id: 10,
    text: "رزروهای گذشته",
    accordion: false,
    accordionLinks: [],
    link: "/dashboard/history-reserve",
    href: "/dashboard/history-reserve?page=1",
    icon: <ClockIcon className="size-5 text-gray-500" />,
  },
  {
    id: 11,
    text: "رزروهای پیش رو",
    accordion: false,
    accordionLinks: [],
    link: "/dashboard/upcoming-reserve",
    href: "/dashboard/upcoming-reserve?page=1",
    icon: <ListStart className="size-5 text-gray-500" />,
  },
  // {
  //   id: 3,
  //   accordion: true,
  //   accordionLinks: [
  //     {
  //       id: 1,
  //       text: "رزروهای گذشته",
  //       href: "/dashboard/history-reserve?page=1",
  //     },
  //     {
  //       id: 2,
  //       text: "رزروهای پیش رو",
  //       href: "/dashboard/upcoming-reserve?page=1",
  //     },
  //   ],
  //   text: "تاریخچه رزروها",
  //   link: "/dashboard/history-reserve",
  //   icon: <ClockIcon className="size-5 text-gray-500" />,
  // },
  {
    id: 4,
    accordion: false,
    accordionLinks: [],
    text: "کیف پول",
    link: "/dashboard/wallet",
    href: "/dashboard/wallet?page=1",
    icon: <WalletIcon className="size-5 text-gray-500" />,
  },
  {
    id: 5,
    accordion: false,
    accordionLinks: [],
    text: "پروفایل کاربری",
    link: "/dashboard/profile",
    href: "/dashboard/profile",
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
    <Sidebar
      className="shadow-xl"
      side="right"
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarHeader className="p-2 gap-0 flex flex-row w-full h-21">
        <Link
          href="/dashboard"
          className={` bg-white w-full py-3 items-center ${
            open ? "flex" : "hidden"
          }`}
        >
          <Image
            width={300}
            height={113}
            src="/assets/images/logo-green.webp"
            alt="لوگو هوبرنیکس"
          />
        </Link>
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
                  className={`cursor-pointer hover:text-(--base-green) ${
                    pathname === item.link
                      ? "text-(--base-green) font-IRANSansBold"
                      : "text-(--base-black)"
                  }`}
                >
                  {item.icon}
                </div>
              ) : (
                <div
                  key={item.id}
                  className={`w-full hover:text-(--base-green) ${
                    pathname.startsWith(item.link)
                      ? "text-(--base-green) font-IRANSansBold"
                      : "text-(--base-black)"
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
                              className={`hover:text-(--base-green) h-8 ${
                                pathname === item.href
                                  ? "text-(--base-green)"
                                  : "text-(--base-black)"
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
                className={`w-full h-13.5 hover:text-(--base-green) flex items-center justify-center rounded-md ${
                  pathname === item.link
                    ? "text-(--base-green) font-IRANSansBold bg-(--light-green)"
                    : "text-(--base-black)"
                }`}
              >
                {pathname === item.link && (
                  <span className="h-full w-1 bg-(--base-green)"></span>
                )}
                <SidebarMenuButton
                  className="h-full hover:bg-(--light-green)"
                  asChild
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.text}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t mb-6">
        <Button
          className="p-3 items-start justify-start gap-4 h-full text-red-500"
          variant="ghost"
          onClick={handleLogoutUser}
        >
          <LogOutIcon className="size-5" />
          <p>خروج از حساب کاربری</p>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

export default SidebarApp;

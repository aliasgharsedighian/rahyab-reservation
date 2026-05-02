"use client";

import React, { useState } from "react";
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
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClockIcon,
  HomeIcon,
  ListIcon,
  PanelRight,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const dashboardList = [
  {
    id: 1,
    accordion: false,
    accordionLinks: [],
    text: "خانه",
    link: "/dashboard/home",
    icon: <HomeIcon className="size-5 text-gray-500" />,
  },
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
        href: "/dashboard/history-reserve",
      },
      {
        id: 2,
        text: "رزروهای پیش رو",
        href: "/dashboard/upcoming-reserve",
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

  return (
    <Sidebar className="" side="right" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-0 gap-0 flex flex-row w-full">
        {/* <Link
          href="/dashboard"
          className={` bg-white w-full py-3 items-center ${
            open ? "flex" : "hidden"
          }`}
        >
          
        </Link> */}
        <Button
          className="rounded-none h-full text-white"
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
                  className={`cursor-pointer hover:text-yellow-600 ${
                    pathname === item.link
                      ? "text-yellow-600 font-IRANSansBold"
                      : "text-black"
                  }`}
                >
                  {item.icon}
                </div>
              ) : (
                <div
                  key={item.id}
                  className={`w-full hover:text-yellow-600 ${
                    pathname.startsWith(item.link)
                      ? "text-yellow-600 font-IRANSansBold"
                      : "text-black"
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
                          <SidebarMenuButton asChild>
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
                              className={`hover:text-yellow-600 ${
                                pathname === item.href
                                  ? "text-yellow-600"
                                  : "text-black"
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
                className={`w-full hover:text-yellow-600 flex items-center justify-center ${
                  pathname === item.link
                    ? "text-yellow-600 font-IRANSansBold"
                    : "text-black"
                }`}
              >
                <SidebarMenuButton asChild>
                  <Link href={item.link}>
                    {item.icon}
                    <span>{item.text}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ),
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

export default SidebarApp;

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
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BellIcon,
  Clock3Icon,
  ClipboardListIcon,
  HistoryIcon,
  LogOutIcon,
  MailIcon,
  PhoneCallIcon,
  ShieldCheckIcon,
  UserCircle2Icon,
  WalletCardsIcon,
  PanelRight,
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
    icon: <ClipboardListIcon className="size-5 text-gray-500" />,
  },
  {
    id: 10,
    text: "رزروهای گذشته",
    accordion: false,
    accordionLinks: [],
    link: "/dashboard/history-reserve",
    href: "/dashboard/history-reserve?page=1",
    icon: <HistoryIcon className="size-5 text-gray-500" />,
  },
  {
    id: 11,
    text: "رزروهای پیش رو",
    accordion: false,
    accordionLinks: [],
    link: "/dashboard/upcoming-reserve",
    href: "/dashboard/upcoming-reserve?page=1",
    icon: <Clock3Icon className="size-5 text-gray-500" />,
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
    icon: <WalletCardsIcon className="size-5 text-gray-500" />,
  },
  {
    id: 5,
    accordion: false,
    accordionLinks: [],
    text: "پروفایل کاربری",
    link: "/dashboard/profile",
    href: "/dashboard/profile",
    icon: <UserCircle2Icon className="size-5 text-gray-500" />,
  },
  {
    id: 6,
    accordion: false,
    accordionLinks: [],
    text: "اعلان ها",
    link: "/dashboard/notifications",
    href: "/dashboard/notifications?page=1",
    icon: <BellIcon className="size-5 text-gray-500" />,
  },
];

function SidebarApp() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const { push } = useRouter();

  const [openRulesModal, setOpenRulesModal] = useState(false);
  const [openContactModal, setOpenContactModal] = useState(false);

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
    <>
      <Dialog open={openContactModal} onOpenChange={setOpenContactModal}>
        <DialogContent className="sm:max-w-md rounded-2xl border-0 p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-green-600 to-emerald-500 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
                <PhoneCallIcon className="size-6" />
                تماس با ما
              </DialogTitle>
            </DialogHeader>

            <p className="text-center text-sm text-white/90 mt-3 leading-7">
              در صورت وجود هرگونه مشکل یا سوال می‌توانید با ما در ارتباط باشید.
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4 flex items-center gap-4 hover:bg-muted transition">
              <div className="bg-green-100 text-green-600 p-3 rounded-full">
                <PhoneCallIcon className="size-5" />
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  شماره تماس
                </span>
                <span className="font-bold tracking-wide">021-12345678</span>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4 flex items-center gap-4 hover:bg-muted transition">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                <MailIcon className="size-5" />
              </div>

              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  ایمیل پشتیبانی
                </span>
                <span className="font-bold">support@example.com</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                className="w-full rounded-xl h-11"
                onClick={() => setOpenContactModal(false)}
              >
                متوجه شدم
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={openRulesModal} onOpenChange={setOpenRulesModal}>
        <DialogContent className="sm:max-w-md  max-w-xl rounded-2xl border-0 p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-600 to-green-500 p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center font-bold flex items-center justify-center gap-2">
                <ShieldCheckIcon className="size-6" />
                قوانین و مقررات
              </DialogTitle>
            </DialogHeader>

            <p className="text-center text-sm text-white/90 mt-3">
              لطفاً پیش از استفاده از سامانه قوانین زیر را مطالعه نمایید.
            </p>
          </div>

          <div className="p-6">
            <div className="text-sm text-gray-600 leading-8 space-y-4 max-h-[400px] overflow-y-auto pr-1">
              <div className="rounded-xl bg-muted/40 p-4">
                استفاده از سیستم رزرو غذا به منزله پذیرش کامل قوانین و مقررات
                می‌باشد.
              </div>

              <div className="rounded-xl bg-muted/40 p-4">
                کاربران موظف هستند سفارش غذای خود را در بازه زمانی مشخص شده ثبت
                نمایند.
              </div>

              <div className="rounded-xl bg-muted/40 p-4">
                لغو رزرو تنها تا قبل از زمان تعیین شده امکان‌پذیر است.
              </div>

              <div className="rounded-xl bg-muted/40 p-4">
                مسئولیت صحت اطلاعات حساب کاربری بر عهده کاربر می‌باشد.
              </div>

              <div className="rounded-xl bg-muted/40 p-4">
                هرگونه استفاده غیرمجاز از سامانه پیگرد قانونی خواهد داشت.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
                              onClick={() => {
                                if (isMobile) {
                                  setOpenMobile(false);
                                } else {
                                  // setOpen(false);
                                }
                              }}
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
                    onClick={() => {
                      if (isMobile) {
                        setOpenMobile(false);
                      } else {
                        // setOpen(false);
                      }
                    }}
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
          {/* Rules */}
          <SidebarMenuItem className="w-full h-10 flex items-center justify-center rounded-md">
            <SidebarMenuButton
              className="h-full hover:bg-(--light-green)"
              asChild
            >
              <Button
                className="p-3 items-start justify-start gap-4 h-full"
                variant="ghost"
                onClick={() => setOpenRulesModal(true)}
              >
                <ShieldCheckIcon className="size-5 text-emerald-600" />
                <p>قوانین و مقررات</p>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* Contact */}
          <SidebarMenuItem className="w-full h-10 flex items-center justify-center rounded-md">
            <SidebarMenuButton
              className="h-full hover:bg-(--light-green)"
              asChild
            >
              <Button
                className="p-3 items-start justify-start gap-4 h-full"
                variant="ghost"
                onClick={() => setOpenContactModal(true)}
              >
                <PhoneCallIcon className="size-5 text-sky-600" />
                <p>تماس با ما</p>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem
            className={`w-full h-10 hover:text-(--base-green) flex items-center justify-center rounded-md`}
          >
            <SidebarMenuButton
              onClick={() => {
                if (isMobile) {
                  setOpenMobile(false);
                } else {
                  // setOpen(false);
                }
              }}
              className="h-full hover:bg-(--light-green)"
              asChild
            >
              <Button
                className="p-3 items-start justify-start gap-4 h-full text-red-500"
                variant="ghost"
                onClick={handleLogoutUser}
              >
                <LogOutIcon className="size-5 text-red-500" />
                <p>خروج از حساب کاربری</p>
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

export default SidebarApp;

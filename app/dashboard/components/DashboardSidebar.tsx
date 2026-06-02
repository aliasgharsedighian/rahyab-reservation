"use client";

import logoutCookiesAction from "@/actions/logoutCookiesAction";
import { Button } from "@/components/ui/button";
import { logOut } from "@/redux/features/auth-slice";
import {
  ClockIcon,
  HomeIcon,
  ListIcon,
  Loader2,
  LogOutIcon,
  MoveRightIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import SidebarApp from "./SidebarApp";

const dashboardList = [
  // {
  //   id: 1,
  //   text: "خانه",
  //   link: "/dashboard/home",
  //   icon: <HomeIcon className="size-5 text-gray-500" />,
  // },
  {
    id: 2,
    text: "رزرو غذا",
    link: "/dashboard/reserve",
    icon: <ListIcon className="size-5 text-gray-500" />,
  },
  {
    id: 3,
    text: "تاریخچه رزروها",
    link: "/dashboard/history-reserve",
    icon: <ClockIcon className="size-5 text-gray-500" />,
  },
  {
    id: 4,
    text: "کیف پول",
    link: "/dashboard/wallet",
    icon: <WalletIcon className="size-5 text-gray-500" />,
  },
  {
    id: 5,
    text: "پروفایل کاربری",
    link: "/dashboard/profile",
    icon: <UserIcon className="size-5 text-gray-500" />,
  },
];

function DashboardSidebar() {
  return <SidebarApp />;
}

//   const dashboardBackButton = () => {
//     if (
//       pathname === "/dashboard/orders" ||
//       pathname === "/dashboard/wishlists" ||
//       pathname === "/dashboard/profile" ||
//       pathname === "/dashboard/membership" ||
//       pathname === "/dashboard/payments"
//     ) {
//       router.push("/dashboard");
//     } else {
//       router.back();
//     }
//   };

//   return (
//     <>
//       <div className="hidden md:block w-full border rounded-md min-h-[400px]">
//         <div className="flex flex-col">
//           {dashboardList.map((item) => (
//             <Link
//               className="flex items-center gap-4 border-b p-3 hover:bg-gray-100 transition-all duration ease-out"
//               key={item.id}
//               href={item.link}
//             >
//               {item.icon}
//               <p className="">{item.text}</p>
//             </Link>
//           ))}
//           <Button
//             disabled={isPending}
//             className="p-3 items-start justify-start gap-4 h-full text-[var(--main-red)]"
//             variant="ghost"
//             onClick={handleLogoutUser}
//           >
//             {isPending ? (
//               <Loader2 className="size-5 animate-spin" />
//             ) : (
//               <LogOutIcon className="size-5" />
//             )}

//             <p>خروج از حساب کاربری</p>
//           </Button>
//         </div>
//       </div>
//       {pathname === "/dashboard" ? null : (
//         <div className="flex md:hidden w-full py-2">
//           <Button
//             className="flex items-center gap-4 p-3 text-base"
//             variant={"ghost"}
//             onClick={dashboardBackButton}
//           >
//             <MoveRightIcon className="size-5" />
//             <p>بازگشت</p>
//           </Button>
//         </div>
//       )}
//     </>
//   );
// }

export default DashboardSidebar;

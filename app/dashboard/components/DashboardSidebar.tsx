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
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const [openSidebar, setOpenSidebar] = useState(true);
  const [isPending, startTransition] = useTransition();

  function changeWidth() {
    if (window.innerWidth < 640) {
      setOpenSidebar(false);
    }
  }

  useEffect(() => {
    if (window.innerWidth < 640) {
      setOpenSidebar(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", changeWidth);
    return () => {
      window.removeEventListener("resize", changeWidth);
    };
  }, [openSidebar]);

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
          router.push("/");
          toast.success(result.message);
        } else {
          localStorage.removeItem("token");
          dispatch(logOut());
          logoutCookiesAction();

          router.push("/");
        }
      } catch (error) {
        console.log(error);
      }
    });
  };

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

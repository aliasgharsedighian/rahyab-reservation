"use client";

import { Button } from "@/components/ui/button";
import { logOut } from "@/redux/features/auth-slice";
import {
  ClockIcon,
  HomeIcon,
  ListIcon,
  LogOutIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const dashboardList = [
  {
    id: 1,
    text: "خانه",
    link: "/dashboard/home",
    icon: <HomeIcon className="size-5 text-gray-500" />,
  },
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
function DashboardPage() {
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
          `${process.env.NEXT_PUBLIC_API_ADDRESS}logout`,
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
    <div className="w-full block md:hidden">
      <div className="flex flex-col">
        {dashboardList.map((item) => (
          <Link
            className="flex items-center gap-4 border-b last:border-none p-3 hover:bg-gray-100 transition-all duration ease-out"
            key={item.id}
            href={item.link}
          >
            {item.icon}
            <p className="">{item.text}</p>
          </Link>
        ))}
        <Button
          className="p-3 items-start justify-start gap-4 h-full text-[var(--main-red)]"
          variant="ghost"
          onClick={handleLogoutUser}
        >
          <LogOutIcon className="size-5" />
          <p>خروج از حساب کاربری</p>
        </Button>
      </div>
    </div>
  );
}

export default DashboardPage;

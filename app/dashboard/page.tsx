"use client";

import { apiClient } from "@/lib/api/client";

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
import DashboardHeader from "./components/DashboardHeader";

function DashboardPage() {
  const dispatch = useDispatch();
  const { push } = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogoutUser = () => {
    startTransition(async () => {
      try {
        const { data: result } = await apiClient.post("logout");
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
    <div className="flex flex-col gap-6 w-full mb-40 md:mb-10">
      <DashboardHeader title={"پیشخوان"} />
    </div>
  );
}

export default DashboardPage;

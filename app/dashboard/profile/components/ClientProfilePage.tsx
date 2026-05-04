"use client";

import useDetectMobile from "@/app/components/hooks/DetectMobile";
import ProfileForm from "./ProfileForm";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";
import { useTransition } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logOut } from "@/redux/features/auth-slice";
import { toast } from "sonner";
import logoutCookiesAction from "@/actions/logoutCookiesAction";

function ClientProfilePage({ profile, revalidateData }: any) {
  const isMobile = useDetectMobile();
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
    <div className="flex gap-6 w-full">
      <div className="w-full md:basis-9/12 mx-4">
        <ProfileForm profile={profile} />
      </div>
      {isMobile ? null : (
        <div className="basis-3/12 w-full">
          <div>
            <Button
              className="p-3 items-start justify-start gap-4 h-full text-red-500"
              variant="ghost"
              onClick={handleLogoutUser}
            >
              <LogOutIcon className="size-5" />
              <p>خروج از حساب کاربری</p>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientProfilePage;

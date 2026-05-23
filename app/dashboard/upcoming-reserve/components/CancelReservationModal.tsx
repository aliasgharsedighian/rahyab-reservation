"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";

interface CancelFoodModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  reservationId: number | null;
  revalidateData: any;
}

function CancelReservationModal({
  open,
  setOpen,
  reservationId,
  revalidateData,
}: CancelFoodModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancelFood = async () => {
    const token = localStorage.getItem("token");

    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    console.log(reservationId);

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations/${reservationId}/cancel`,
        {
          method: "POST",
          headers,
        },
      );

      const response = await res.json();

      if (response.status === 200) {
        toast.success(response.message || "رزرو غذا لغو شد");
        setReason("");
        setOpen(false);
        revalidateData();
      } else {
        toast.error(response.message || "خطا در لغو رزرو");
      }
    } catch (err) {
      console.error(err);
      toast.error("مشکلی پیش آمده است");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="rtl max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-2">
            <div className="bg-red-100 text-red-600 p-3 rounded-full">
              <TriangleAlert className="w-6 h-6" />
            </div>
          </div>

          <AlertDialogTitle className="text-center iranSansBold text-xl">
            لغو رزرو غذا
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center leading-7">
            آیا از لغو این رزرو مطمئن هستید؟
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogAction asChild>
            <Button
              onClick={handleCancelFood}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "در حال لغو..." : "تایید لغو"}
            </Button>
          </AlertDialogAction>

          <AlertDialogCancel asChild>
            <Button variant="outline">انصراف</Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CancelReservationModal;

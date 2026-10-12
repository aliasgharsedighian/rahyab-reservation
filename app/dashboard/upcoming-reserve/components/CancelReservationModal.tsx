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

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TriangleAlert } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import type { CancelReservationResponse, ReservationUpcomingItem } from "../types";

interface CancelFoodModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  reservationId: number | null;
  revalidateData: () => void | Promise<void>;
  reservation?: ReservationUpcomingItem;
}

function CancelReservationModal({
  open,
  setOpen,
  reservationId,
  reservation,
  revalidateData,
}: CancelFoodModalProps) {
  const [loading, setLoading] = useState(false);

  const handleCancelFood = async () => {
    if (loading || reservationId === null) return;

    try {
      setLoading(true);

      const { data: response } = await apiClient.post<CancelReservationResponse>(
        `reservations/${reservationId}/cancel`,
      );

      if (response.status === 200) {
        toast.success(response.message || "رزرو غذا لغو شد");
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
    <AlertDialog open={open} onOpenChange={(nextOpen) => { if (!loading) setOpen(nextOpen); }}>
      <AlertDialogContent dir="rtl" className="rtl max-h-[90dvh] overflow-y-auto rounded-2xl data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-md">
        <AlertDialogHeader className="sm:group-data-[size=default]/alert-dialog-content:place-items-center sm:group-data-[size=default]/alert-dialog-content:text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <TriangleAlert className="size-6" aria-hidden="true" />
            </div>
          </div>

          <AlertDialogTitle className="text-center iranSansBold text-xl">
            لغو رزرو غذا
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center leading-7">
            آیا از لغو این رزرو مطمئن هستید؟
          </AlertDialogDescription>
        </AlertDialogHeader>
        {reservation && (
          <div className="space-y-2 rounded-xl border bg-muted/40 p-4 text-right text-sm">
            <p className="break-words font-bold leading-7">{reservation.food_name}</p>
            <p className="flex flex-wrap gap-x-2 text-(--secondary-text)"><span>{reservation.reserve_day_name}</span><span dir="ltr">{reservation.reserve_date_jalali}</span><span>· {reservation.quantity.toLocaleString("fa-IR")} عدد</span></p>
          </div>
        )}
        <AlertDialogFooter className="grid grid-cols-2 gap-2 sm:grid">
          <AlertDialogAction asChild>
            <Button
              onClick={(event) => { event.preventDefault(); void handleCancelFood(); }}
              disabled={loading}
              className="h-11 bg-red-600 text-white hover:bg-red-700"
            >
              {loading ? "در حال لغو..." : "تایید لغو"}
            </Button>
          </AlertDialogAction>

          <AlertDialogCancel asChild>
            <Button variant="outline" className="h-11" disabled={loading}>انصراف</Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CancelReservationModal;

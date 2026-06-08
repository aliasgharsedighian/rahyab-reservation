"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import CancelReservationModal from "./CancelReservationModal";
import ReservationFilters from "../../components/ReservationFilters";

function ReserveUpcomingTable({ reserveUpcoming, revalidateData }: any) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleOpenModal = (foodId: number, id: number) => {
    setSelectedId(id);
    setOpen(true);
  };

  return (
    <>
      <CancelReservationModal
        open={open}
        setOpen={setOpen}
        reservationId={selectedId}
        revalidateData={revalidateData}
      />

      <ReservationFilters />

      <div className="w-full overflow-x-auto rounded-md">
        <div className="border border-border text-sm grid grid-cols-[50px_100px_50px_180px_100px_100px_100px_50px] lg:grid-cols-12 bg-transparent text-(--secondary-text) rounded-t-md min-w-max lg:min-w-full">
          <div className="lg:col-span-1 p-2 md:p-4 flex items-center">ردیف</div>

          <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
            تاریخ
          </div>

          <div className="lg:col-span-1 p-2 md:p-4 flex items-center">روز</div>

          <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
            نام غذا
          </div>

          <div className="lg:col-span-1 p-2 md:p-4 flex items-center">
            تعداد
          </div>

          <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
            قیمت واحد (تومان)
          </div>

          <div className="lg:col-span-2 p-4 flex items-center">
            جمع کل (تومان)
          </div>

          <div className="lg:col-span-1 p-2 md:p-4 flex items-center">لغو</div>
        </div>

        {reserveUpcoming.length === 0 && (
          <div className="border border-border border-t-0 p-8 text-center text-(--secondary-text)">
            موردی یافت نشد
          </div>
        )}

        {reserveUpcoming.map((item: any, index: number) => (
          <div
            key={item.id}
            className={`border-l border-b text-sm grid grid-cols-[50px_100px_50px_180px_100px_100px_100px_50px] lg:grid-cols-12 hover:bg-(--light-green) transition min-w-max lg:min-w-full ${
              item.status === "cancelled" ? "bg-red-50 text-red-600" : ""
            }`}
          >
            <div className="lg:col-span-1 p-2 md:p-4 border-r flex items-center">
              {index + 1}
            </div>

            <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
              {item.reserve_date_jalali}
            </div>

            <div className="lg:col-span-1 p-2 md:p-4 flex items-center">
              {item.reserve_day_name}
            </div>

            <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
              {item.food_name}
            </div>

            <div className="lg:col-span-1 p-2 md:p-4 flex items-center">
              {item.quantity}
            </div>

            <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
              <span className="bg-(--light-green) text-(--base-green) py-1 px-2 rounded-lg">
                {item.unit_price.toLocaleString()}
              </span>
            </div>

            <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
              <span className="bg-(--light-green) text-(--base-green) py-1 px-2 rounded-lg">
                {item.total_paid.toLocaleString()}
              </span>
            </div>

            <div className="lg:col-span-1 p-2 md:p-4 flex items-center text-[12px]">
              {item.status === "cancelled" ? (
                <p>{item.status_fa}</p>
              ) : (
                <Button
                  onClick={() => handleOpenModal(item.food_id, item.id)}
                  variant="destructive"
                  className="p-2"
                >
                  <span className="text-red-600 iranSansBold">لغو</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ReserveUpcomingTable;

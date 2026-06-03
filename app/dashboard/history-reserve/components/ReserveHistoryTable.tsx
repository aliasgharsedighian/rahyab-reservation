"use client";

import { Button } from "@/components/ui/button";
import { ListCheck } from "lucide-react";
import { useState } from "react";
import CommentOnFoodModal from "./CommentOnFoodModal";
import ReservationFilters from "../../components/ReservationFilters";

function ReserveHistoryTable({ reserveHistory, revalidateData }: any) {
  const [open, setOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleOpenModal = (foodId: number, id: number) => {
    setSelectedId(id);
    setSelectedFoodId(foodId);
    setOpen(true);
  };

  return (
    <>
      <CommentOnFoodModal
        open={open}
        setOpen={setOpen}
        foodId={selectedFoodId}
        reservationId={selectedId}
      />
      <ReservationFilters />
      <div className="w-full overflow-x-auto rounded-md">
        <div className="border text-sm grid grid-cols-[50px_100px_50px_180px_100px_100px_100px_100px] lg:grid-cols-12 bg-transparent text-gray-700 rounded-t-md">
          <div className="lg:col-span-1 p-2 md:p-4  flex items-center">
            ردیف
          </div>
          <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
            تاریخ
          </div>
          <div className="lg:col-span-1 p-2 md:p-4  flex items-center">روز</div>
          <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
            نام غذا
          </div>
          <div className="lg:col-span-1 p-2 md:p-4  flex items-center">
            تعداد
          </div>
          <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
            قیمت واحد (تومان)
          </div>
          <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
            جمع کل (تومان)
          </div>
          <div className="lg:col-span-1 p-2 md:p-4  flex items-center">
            جزییات
          </div>
        </div>

        {reserveHistory.length === 0 && (
          <div className="border border-t-0 p-8 text-center text-gray-500">
            موردی یافت نشد
          </div>
        )}

        {reserveHistory.map((item: any, index: number) => (
          <div
            key={item.id}
            className={`border-l border-b text-sm grid grid-cols-[50px_100px_50px_180px_100px_100px_100px_100px] lg:grid-cols-12  hover:bg-(--light-green) transition ${item.status === "cancelled" ? "bg-red-50 text-red-600" : ""}`}
          >
            <div className="lg:col-span-1 p-2 md:p-4  flex items-center border-r">
              {index + 1}
            </div>
            <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
              {item.reserve_date_jalali}
            </div>
            <div className="lg:col-span-1 p-2 md:p-4 flex items-center">
              {item.reserve_day_name}
            </div>
            <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
              {item.food_name}
            </div>
            <div className="lg:col-span-1 p-2 md:p-4  flex items-center">
              {item.quantity}
            </div>
            <div className="lg:col-span-2 p-2 md:p-4  flex items-center">
              <span className="bg-(--light-green) text-(--base-green) py-1 px-2 rounded-lg">
                {item.unit_price.toLocaleString()}
              </span>
            </div>
            <div className="lg:col-span-2 p-2 md:p-4 flex items-center">
              <span className="bg-(--light-green) text-(--base-green) py-1 px-2 rounded-lg">
                {item.total_paid.toLocaleString()}
              </span>
            </div>
            <div className="lg:col-span-1 p-2 md:p-4 flex items-center">
              {item.status === "cancelled" ? (
                <p>{item.status_fa}</p>
              ) : (
                <Button
                  onClick={() => handleOpenModal(item.food_id, item.id)}
                  variant={"default"}
                  className="p-2 text-[12px]"
                >
                  {/* نظر دهید */}
                  <ListCheck />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ReserveHistoryTable;

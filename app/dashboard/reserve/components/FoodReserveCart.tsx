"use client";

import { Button } from "@/components/ui/button";
import {
  removeAllItemsFromReserve,
  reserveSelectItems,
  reserveSelectTotalPrice,
} from "@/redux/features/reserveBasketSlice";
import { ShoppingBasketIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

function FoodReserveCart({
  revalidateData,
  refresh,
  reserveCart,
  sortedReserveCart,
  totalPrice,
  sendDataToApi,
}: any) {
  return (
    <div className="sticky top-20 flex flex-col w-full border rounded-md">
      <div className="bg-zinc-800 text-white p-2 rounded-t-md">
        <p>خلاصه رزرو </p>
      </div>
      <div
        className={`min-h-48 flex flex-col gap-3 p-3 ${reserveCart.length !== 0 ? "justify-start" : "justify-center"}`}
      >
        {reserveCart.length !== 0 ? (
          sortedReserveCart.map((item: any) => (
            <div
              key={item.id}
              className="text-sm lg:text-base flex items-center justify-between border-b pb-2 last:border-none"
            >
              <p>
                {item.day} {item.jalali_date} {item.name}
              </p>
              <span>{item.count} عدد</span>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <ShoppingBasketIcon className="size-12 text-gray-500" />
            <p>سبد شما خالی است</p>
          </div>
        )}
      </div>
      {reserveCart.length !== 0 ? (
        <>
          <div className="min-h-16 border-t">
            <div className="flex items-center justify-between px-3 pt-3">
              <p className="iranSansBold">قیمت کل</p>
              <span className="flex items-center gap-7 iranSansBold text-sm md:text-base">
                {totalPrice.toLocaleString()}

                {"تومان"}
              </span>
            </div>
          </div>
          <Button size="lg" onClick={sendDataToApi}>
            پرداخت
          </Button>
        </>
      ) : null}
    </div>
  );
}

export default FoodReserveCart;

"use client";

import { Button } from "@/components/ui/button";
import {
  removeAllItemsFromReserve,
  removeFromReserveBasket,
  reserveSelectItems,
  reserveSelectTotalPrice,
} from "@/redux/features/reserveBasketSlice";
import { ForkKnife, ShoppingBasketIcon, Trash2Icon } from "lucide-react";
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
  const dispatch = useDispatch();

  return (
    <div className="sticky top-20">
      <div className="p-2 rounded-t-md flex items-center gap-2">
        <ShoppingBasketIcon className="size-6 text-(--base-green)" />
        <p className="font-bold">سبد رزرو شما</p>
      </div>
      <div
        className={`min-h-48 flex flex-col gap-3 p-3 ${reserveCart.length !== 0 ? "justify-start" : "justify-center"}`}
      >
        {reserveCart.length !== 0 ? (
          sortedReserveCart.map((item: any) => (
            <div
              key={item.id}
              className="text-sm lg:text-base flex items-start justify-between border-b pb-2 last:border-none"
            >
              <div className="flex items-center gap-2">
                <div className="bg-(--light-green) p-2 rounded-full">
                  <ForkKnife className="text-(--base-green)" />
                </div>
                <div className="flex flex-col gap-1 items-start text-sm">
                  <p>{item.name}</p>
                  <span>
                    {item.day} {item.jalali_date}
                  </span>
                  <span>{item.count} عدد</span>
                </div>
              </div>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-sm text-red-400"
                onClick={() =>
                  dispatch(removeFromReserveBasket({ id: item.id }))
                }
              >
                <Trash2Icon className="text-red-400 size-4" />
                <span>حذف</span>
              </Button>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <ShoppingBasketIcon className="size-12 text-(--base-green)" />
            <p className="text-(--secondary-text)">سبد شما خالی است</p>
          </div>
        )}
      </div>
      {reserveCart.length !== 0 ? (
        <div className="w-full flex flex-col gap-4 px-3">
          <div className="border-t">
            {/* <div className="flex items-center justify-between pt-3">
              <p className="">جمع تعداد</p>
              <span className="flex items-center gap-7 text-sm md:text-base">
                {1} {"پرس"}
              </span>
            </div> */}
            <div className="flex items-center justify-between pt-3">
              <p className="">مبلغ کل</p>
              <span className="flex items-center gap-7 text-sm md:text-base">
                {totalPrice.toLocaleString()}

                {"تومان"}
              </span>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={sendDataToApi}>
            ثبت و نهایی کردن رزرو
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default FoodReserveCart;

"use client";

import { Button } from "@/components/ui/button";
import {
  removeAllItemsFromReserve,
  removeFromReserveBasket,
  reserveSelectItems,
  reserveSelectTotalPrice,
} from "@/redux/features/reserveBasketSlice";
import {
  ChevronUp,
  ForkKnife,
  ShoppingBasketIcon,
  Trash2Icon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { DialogTitle } from "@/components/ui/dialog";
import { DirectionProvider } from "@/components/ui/direction";
import { ScrollArea } from "@/components/ui/scroll-area";

function FoodReserveCardMobile({
  reserveCart,
  sortedReserveCart,
  totalPrice,
  sendDataToApi,
}: any) {
  const dispatch = useDispatch();

  if (reserveCart.length === 0) return;
  return (
    <div className="flex flex-col bg-white fixed bottom-0 w-full right-0 h-30 z-20 shadow-2xl border-t pt-6">
      <Drawer>
        <DrawerTrigger>
          {" "}
          <div className="flex items-center gap-2 w-full justify-center absolute h-16.5 -top-3.5">
            <p className="text-[12px] text-(--base-green)">مشاهده سبد</p>
            <ChevronUp className="size-5" />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerDescription></DrawerDescription>
          <DialogTitle></DialogTitle>
          <DrawerHeader>
            <DrawerClose>بستن</DrawerClose>
          </DrawerHeader>

          <DirectionProvider dir="rtl">
            <ScrollArea className="h-auto max-h-[75vh] overflow-auto">
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
            </ScrollArea>
          </DirectionProvider>
          <DrawerFooter className="border-t">
            {" "}
            {reserveCart.length !== 0 ? (
              <div className="w-full flex flex-col gap-4 px-3">
                <div className="">
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
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="w-full flex flex-col gap-1 px-3">
        <div className="">
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
    </div>
  );
}

export default FoodReserveCardMobile;

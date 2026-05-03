"use client";

import { Button } from "@/components/ui/button";
import {
  removeAllItemsFromReserve,
  reserveSelectItems,
  reserveSelectTotalPrice,
} from "@/redux/features/reserveBasketSlice";
import { ChevronUp, ShoppingBasketIcon } from "lucide-react";
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

function FoodReserveCardMobile({
  reserveCart,
  sortedReserveCart,
  totalPrice,
  sendDataToApi,
}: any) {
  return (
    <div className="flex flex-col bg-white fixed bottom-0 w-full right-0 h-28 z-20 shadow-2xl border-t">
      <Drawer>
        <DrawerTrigger>
          {" "}
          <div className="pt-3 flex items-center w-full justify-center">
            <p className="text-sm">مشاهده بیشتر</p>
            <ChevronUp className="size-5" />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerDescription></DrawerDescription>
          <DialogTitle></DialogTitle>
          <DrawerHeader>
            <DrawerClose>
              <Button variant="outline">بستن</Button>
            </DrawerClose>
          </DrawerHeader>
          <div
            className={`min-h-48 flex flex-col gap-3 p-3 ${reserveCart.length !== 0 ? "justify-start" : "justify-center"}`}
          >
            {reserveCart.length !== 0 ? (
              sortedReserveCart.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-2 last:border-none"
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

          <div className="flex items-center pt-3">
            <div className="flex items-center justify-between px-6">
              <p className="font-IRANSansBold">قیمت کل</p>
              <span className="flex items-center gap-7 font-IRANSansBold pl-14 text-sm md:text-base">
                {totalPrice.toLocaleString()}

                {process.env.price}
              </span>
            </div>
            <Button type="button" onClick={sendDataToApi} className="w-fit">
              پرداخت
            </Button>
          </div>
          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>

      <div className="flex items-center pt-3 w-full">
        <div className="flex items-center justify-between px-6">
          <p className="font-IRANSansBold">قیمت کل</p>
          <span className="flex items-center gap-7 font-IRANSansBold pl-14 text-sm md:text-base">
            {totalPrice.toLocaleString()}

            {process.env.price}
          </span>
        </div>
        <Button type="button" onClick={sendDataToApi} className="w-fit">
          پرداخت
        </Button>
      </div>
    </div>
  );
}

export default FoodReserveCardMobile;

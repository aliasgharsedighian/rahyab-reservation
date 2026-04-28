"use client";

import { Button } from "@/components/ui/button";
import {
  reserveSelectItems,
  reserveSelectTotalPrice,
} from "@/redux/features/reserveBasketSlice";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function FoodReserveCard() {
  const reserveCart = useSelector(reserveSelectItems);
  const totalPrice = useSelector(reserveSelectTotalPrice);

  const [sortedReserveCart, setSortedReserveCart] = useState<any>([]);

  useEffect(() => {
    const sortedReserveCart = [...reserveCart].sort((a, b) => {
      // Assuming item.jalali_date is in 'YYYY-MM-DD' format or similar
      // If it's a different format, you might need to parse it into Date objects
      // or a comparable numerical representation.
      return a.jalali_date.localeCompare(b.jalali_date);
    });

    setSortedReserveCart(sortedReserveCart);
  }, [reserveCart]);

  return (
    <div className="flex flex-col w-full border">
      <div className="bg-zinc-800 text-white">
        <p>خلاصه رزرو هفته</p>
      </div>
      <div className="min-h-48">
        {sortedReserveCart.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between">
            <p>
              {item.day} {item.jalali_date} {item.name}
            </p>
            <span>{item.count} عدد</span>
          </div>
        ))}
      </div>
      <div className="min-h-36">
        <div className="flex items-center justify-between px-6 pt-3">
          <p className="iranSansBold">قیمت کل</p>
          <span className="flex items-center gap-7 iranSansBold text-sm md:text-base">
            {totalPrice.toLocaleString()}

            {"تومان"}
          </span>
        </div>
      </div>
      <Button>پرداخت</Button>
    </div>
  );
}

export default FoodReserveCard;

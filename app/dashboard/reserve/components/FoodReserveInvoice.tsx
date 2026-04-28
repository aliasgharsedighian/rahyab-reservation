"use client";

import { Button } from "@/components/ui/button";
import {
  addToReserveBasket,
  decrementReserveCount,
  incrementReserveCount,
  reserveSelectItems,
} from "@/redux/features/reserveBasketSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function FoodReserveInvoice({
  food_id,
  weekly_menu_id,
  name,
  price,
  day,
  jalali_date,
  date,
}: any) {
  const dispatch = useDispatch();

  const reserveCart = useSelector(reserveSelectItems);

  const [countInput, setCountInput] = useState(0);

  useEffect(() => {
    if (reserveCart.length === 0) {
      return;
    } else {
      const item = reserveCart.find((item: any) => item.id === food_id);
      if (item) {
        setCountInput(item?.count);
      } else {
        setCountInput(0);
      }
    }
  }, []);

  const itemToBasket = {
    id: weekly_menu_id,
    food_id,
    name,
    price,
    day,
    jalali_date,
    date,
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[14px] text-[var(--base-gray)]">
          {/* <label htmlFor="count-input">تعداد</label> */}
          <div
            className={`border rounded-md shadow-md flex items-center justify-between py-1 px-2 gap-3`}
          >
            <Button
              variant={"ghost"}
              className="!border-none"
              onClick={() => {
                setCountInput((prev) => prev + 1);
                setTimeout(() => {
                  dispatch(
                    addToReserveBasket({ ...itemToBasket, count: countInput }),
                  );
                }, 100);
                setTimeout(() => {
                  dispatch(incrementReserveCount(weekly_menu_id));
                }, 300);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`w-5 h-5 text-blue-500`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m6-6H6"
                />
              </svg>
            </Button>
            <div className="flex flex-col gap-1 items-center justify-center">
              <p className="iranSansBold">{countInput}</p>
            </div>
            <Button
              variant={"ghost"}
              className="!border-none"
              disabled={countInput <= 0}
              onClick={() => {
                setCountInput((prev) => prev - 1);
                dispatch(decrementReserveCount(weekly_menu_id));
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={`w-5 h-5 ${
                  countInput !== 1 && "text-[var(--base-blue)]"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 12H6"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodReserveInvoice;

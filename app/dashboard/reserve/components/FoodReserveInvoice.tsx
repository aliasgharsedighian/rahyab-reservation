"use client";

import { Button } from "@/components/ui/button";
import {
  addToReserveBasket,
  decrementReserveCount,
  incrementReserveCount,
  removeFromReserveBasket,
  reserveSelectItemCountById,
} from "@/redux/features/reserveBasketSlice";
import { Trash2Icon } from "lucide-react";
import React from "react";
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

  // مستقیم از ریداکس
  const countInput = useSelector(reserveSelectItemCountById(weekly_menu_id));

  const itemToBasket = {
    id: weekly_menu_id,
    food_id,
    name,
    price,
    day,
    jalali_date,
    date,
  };

  if (countInput <= 0)
    return (
      <Button
        className="max-w-2xs"
        onClick={() => {
          dispatch(
            addToReserveBasket({
              ...itemToBasket,
              count: 1,
            }),
          );
        }}
      >
        رزرو این غذا
      </Button>
    );

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[14px] text-[var(--base-gray)]">
          <div
            className={`border rounded-md shadow-md flex items-center justify-between gap-3`}
          >
            <Button
              variant={"ghost"}
              className="border-none!"
              onClick={() => {
                dispatch(incrementReserveCount(weekly_menu_id));
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
              className="border-none!"
              disabled={countInput <= 0}
              onClick={() => {
                if (countInput - 1 === 0) {
                  dispatch(removeFromReserveBasket({ id: weekly_menu_id }));
                } else {
                  dispatch(decrementReserveCount(weekly_menu_id));
                }
              }}
            >
              {countInput - 1 === 0 ? (
                <Trash2Icon className="size-4" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className={`w-5 h-5`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 12H6"
                  />
                </svg>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FoodReserveInvoice;

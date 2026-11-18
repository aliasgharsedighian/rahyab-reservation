"use client";

import { Button } from "@/components/ui/button";
import {
  addToReserveBasket,
  decrementReserveCount,
  incrementReserveCount,
  removeFromReserveBasket,
  reserveSelectItemCountById,
  reserveSelectItems,
} from "@/redux/features/reserveBasketSlice";
import { Trash2Icon } from "lucide-react";
import { memo } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { getFoodEventProperties, useMenuAnalytics } from "./MenuAnalyticsContext";
import { hasMainFoodForDate, isConfirmedReservation, isSideFood } from "../cartRules";
import type { ReserveFoodType } from "../types";

interface FoodReserveInvoiceProps {
  food_id: number;
  food_category?: string;
  weekly_menu_id: number;
  name: string;
  price: number;
  day: string;
  jalali_date: string;
  date: string;
  isReserve: boolean;
  MaxQuantity: number;
  type: ReserveFoodType;
  type_fa: string;
  hasReservedMainFood: boolean;
  reserveLabel?: string;
}

function FoodReserveInvoice({
  food_id,
  food_category,
  weekly_menu_id,
  name,
  price,
  day,
  jalali_date,
  date,
  isReserve,
  MaxQuantity,
  type,
  type_fa,
  hasReservedMainFood,
  reserveLabel = "رزرو",
}: FoodReserveInvoiceProps) {
  const dispatch = useDispatch();
  const store = useStore<Parameters<typeof reserveSelectItems>[0]>();
  const logEvent = useMenuAnalytics();

  // مستقیم از ریداکس
  const countInput = useSelector(reserveSelectItemCountById(weekly_menu_id));
  const isSide = isSideFood(type);
  const hasMainFoodForDay = useSelector((state: Parameters<typeof reserveSelectItems>[0]) =>
    !isSide || hasMainFoodForDate(reserveSelectItems(state), date, hasReservedMainFood));

  const itemToBasket = {
    id: weekly_menu_id,
    food_id,
    name,
    price,
    day,
    jalali_date,
    date,
    type,
    type_fa,
    reserved_food_day: isConfirmedReservation(hasReservedMainFood),
  };

  function selectFood() {
    const currentCount = reserveSelectItemCountById(weekly_menu_id)(store.getState());
    if (currentCount > 0 || !isReserve || MaxQuantity <= 0 || (isSide && !hasMainFoodForDay)) return;
    dispatch(addToReserveBasket({ ...itemToBasket, count: 1 }));
    if (reserveSelectItemCountById(weekly_menu_id)(store.getState()) > 0) {
      logEvent("food_selected", getFoodEventProperties({
        food_id, food_category, price, is_reserved: isReserve, max_reservation_quantity: MaxQuantity,
      }, date, type));
    }
  }

  if (MaxQuantity === 0) {
    return (
      <Button
        className="h-auto min-h-10 w-full whitespace-normal px-2 py-2 text-xs sm:text-sm"
        disabled={true}
        onClick={selectFood}
      >
        شما حداکثر تعداد را رزرو کردید.
      </Button>
    );
  }

  if (countInput <= 0)
    return (
      <Button
        className="h-auto min-h-10 w-full whitespace-normal px-2 py-2 text-xs sm:text-sm dark:bg-(--base-green) dark:text-white"
        disabled={!isReserve || (isSide && !hasMainFoodForDay)}
        onClick={selectFood}
      >
        {isSide && !hasMainFoodForDay
          ? "ابتدا غذای اصلی این روز را انتخاب کنید"
          : reserveLabel}
      </Button>
    );

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[14px] text-[var(--base-gray)]">
          <div
            className={`min-h-10 w-full border rounded-md shadow-md flex items-center justify-between gap-1`}
          >
            <Button
              variant={"ghost"}
              className="border-none! px-2 sm:px-3"
              disabled={countInput >= MaxQuantity || (isSide && !hasMainFoodForDay)}
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
              className="border-none! px-2 sm:px-3"
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

export default memo(FoodReserveInvoice);

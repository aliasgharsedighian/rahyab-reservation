"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodReserveInvoice from "./FoodReserveInvoice";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import FeedbackModal from "./FeedbackModal";
import { InfoIcon, MessageCircleIcon, StarIcon } from "lucide-react";

interface ReserveFood {
  food_id: number;
  weekly_menu_id: number;
  name: string;
  description?: string | null;
  price: number;
  image_url: string;
  feedback_rate: number | string | null;
  feedback_count: number;
  comment_count: number;
  is_reserved: boolean;
  max_reservation_quantity: number;
}

interface ReserveDay {
  date: string;
  day_name: string;
  jalali_date: string;
  foods: ReserveFood[];
}

interface ReserveWeek {
  range: string;
  is_current_week: boolean;
  week_number: number;
  reservation_message?: string | null;
  days: ReserveDay[];
}

export interface FoodReserveList {
  weeks: ReserveWeek[];
}

interface FoodReserveTabsProps {
  reserveList: FoodReserveList | null;
}

function FoodReserveTabs({ reserveList }: FoodReserveTabsProps) {
  const [open, setOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);

  const handleOpenModal = (foodId: number) => {
    setSelectedFoodId(foodId);
    setOpen(true);
  };

  return (
    <>
      <FeedbackModal open={open} setOpen={setOpen} foodId={selectedFoodId} />

      <Tabs defaultValue={reserveList?.weeks[0]?.range} className="w-full rtl">
        <div className="flex flex-col gap-4">
          <TabsList className="rtl w-full bg-(--light-green)">
            {reserveList?.weeks.map((item) => (
              <TabsTrigger
                key={item.range}
                value={item.range}
                className="text-[12px] md:text-base"
              >
                {item.is_current_week
                  ? "هفته جاری"
                  : `${item.week_number} هفته بعد `}
              </TabsTrigger>
            ))}
          </TabsList>

          {reserveList?.weeks.map((item) => (
            <TabsContent key={item.range} value={item.range}>
              {item.reservation_message ? (
                <div className="flex items-center gap-2 p-4 mb-2 bg-(--light-green) rounded-xl dark:bg--(--dark-green)">
                  <InfoIcon className="size-5 text-red-600" />
                  <p className="text-red-600"> {item.reservation_message}</p>
                </div>
              ) : null}
              <div className="flex flex-col gap-4 md:gap-6">
                {item.days.map((day) => (
                  <div
                    key={day.date}
                    className="flex flex-col gap-4 rounded-2xl border bg-white p-3 shadow-sm md:p-5 dark:bg-zinc-800"
                  >
                    <div className="w-full flex items-center justify-between gap-4">
                      <div className="text-lg relative flex items-center gap-3">
                        <span className="h-8 w-0.5 bg-(--base-green)"></span>
                        <p className="text-(--base-black) font-bold">
                          {day.day_name}
                        </p>
                        <span>{day.jalali_date}</span>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      {day.foods.length !== 0 ? (
                        day.foods.map((food) => (
                          <article
                            key={food.food_id}
                            className="grid overflow-hidden rounded-2xl border bg-zinc-50/70 transition-shadow hover:shadow-md sm:grid-cols-[minmax(0,1fr)_11rem] dark:bg-zinc-900/50"
                          >
                            <div className="order-2 flex min-w-0 flex-col gap-3 p-4 sm:order-1">
                              <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:justify-between">
                                <h3 className="w-full min-w-0 text-lg font-bold leading-7 text-(--base-black) sm:w-auto">
                                  {food.name}
                                </h3>
                                <Button
                                  onClick={() => handleOpenModal(food.food_id)}
                                  variant="outline"
                                  className="h-auto max-w-full shrink-0 self-start rounded-full p-0"
                                >
                                  <div
                                    className="flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-zinc-700 sm:text-xs"
                                    aria-label={`${food.feedback_rate ?? 0} امتیاز از ${food.feedback_count} نظر`}
                                  >
                                    <StarIcon
                                      fill="currentColor"
                                      className="size-4 text-amber-400"
                                      aria-hidden="true"
                                    />
                                    <span className="font-semibold tabular-nums">
                                      {food.feedback_rate ?? "—"}
                                    </span>
                                    <span className="text-zinc-500">
                                      ({food.feedback_count ?? 0} رای) - (
                                      {food.comment_count ?? 0} نظر)
                                    </span>
                                  </div>
                                </Button>
                              </div>
                              {food.description ? (
                                <p className="text-sm leading-6 text-(--secondary-text)">
                                  {food.description}
                                </p>
                              ) : null}
                              <span className="text-base font-semibold text-(--base-black)">
                                {food.price.toLocaleString("fa-IR")} تومان
                              </span>
                              <FoodReserveInvoice
                                food_id={food.food_id}
                                weekly_menu_id={food.weekly_menu_id}
                                name={food.name}
                                price={food.price}
                                day={day.day_name}
                                jalali_date={day.jalali_date}
                                date={day.date}
                                isReserve={food.is_reserved}
                                MaxQuantity={food.max_reservation_quantity}
                              />
                              <Button
                                variant="link"
                                className="h-auto w-fit gap-1.5 p-0 text-(--base-green)"
                                onClick={() => handleOpenModal(food.food_id)}
                              >
                                <MessageCircleIcon className="size-4" />
                                مشاهده نظرات
                              </Button>
                            </div>
                            <div className="order-1 flex items-center justify-center bg-zinc-100 sm:order-2 sm:m-3 sm:aspect-square sm:self-center sm:rounded-xl dark:bg-zinc-800">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                className="aspect-[16/10] h-full w-full rounded-xl object-contain sm:aspect-square"
                                src={food.image_url}
                                alt={food.name}
                                loading="lazy"
                              />
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="rounded-xl bg-zinc-50 p-6 text-center text-sm text-(--secondary-text) dark:bg-zinc-900/50">
                          غذایی برای این روز وجود ندارد
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </>
  );
}

export default FoodReserveTabs;

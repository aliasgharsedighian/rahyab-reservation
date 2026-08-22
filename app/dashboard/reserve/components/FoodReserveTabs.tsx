"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { reserveSelectItems } from "@/redux/features/reserveBasketSlice";
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  InfoIcon,
  MessageCircleIcon,
  StarIcon,
  UtensilsIcon,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import type { ReserveCartItem, ReserveFoodType } from "../types";
import FeedbackModal from "./FeedbackModal";
import FoodReserveInvoice from "./FoodReserveInvoice";

interface ReserveFood {
  food_id: number;
  weekly_menu_id: number;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  feedback_rate: number | string | null;
  feedback_count: number;
  comment_count: number;
  is_reserved: boolean;
  reserved_count: number;
  max_reservation_quantity: number;
}

interface ReserveFoodGroup {
  type: ReserveFoodType;
  type_fa: string;
  items: ReserveFood[];
}

interface ReserveDay {
  date: string;
  day_name: string;
  jalali_date: string;
  reserved_food_day: boolean;
  foods: ReserveFoodGroup[];
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

const fallbackTypeTitle: Record<ReserveFoodType, string> = {
  breakfast: "صبحانه",
  lunch: "ناهار",
  dinner: "شام",
  drink: "نوشیدنی",
  appetizer: "پیش‌غذا",
};

function FoodReserveTabs({
  reserveList,
}: {
  reserveList: FoodReserveList | null;
}) {
  const [open, setOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const reserveItems = useSelector(reserveSelectItems) as ReserveCartItem[];

  const handleOpenModal = (foodId: number) => {
    setSelectedFoodId(foodId);
    setOpen(true);
  };

  const renderFood = (
    food: ReserveFood,
    group: ReserveFoodGroup,
    day: ReserveDay,
  ) => (
    <article
      key={food.weekly_menu_id}
      className="grid overflow-hidden rounded-2xl border bg-zinc-50/70 transition-shadow hover:shadow-md sm:grid-cols-[minmax(0,1fr)_11rem] dark:bg-zinc-900/50"
    >
      <div className="order-2 flex min-w-0 flex-col gap-3 p-4 sm:order-1">
        <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="min-w-0 text-lg font-bold leading-7 text-(--base-black)">
              {food.name}
            </h3>
            {food.reserved_count > 0 ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--base-green)/20 bg-(--light-green) px-2.5 py-1 text-xs font-semibold text-(--base-green)">
                <CheckCircle2Icon className="size-4" aria-hidden="true" />
                شما {food.reserved_count.toLocaleString("fa-IR")} عدد از این
                مورد رزرو کرده‌اید
              </span>
            ) : null}
          </div>
          <Button
            onClick={() => handleOpenModal(food.food_id)}
            variant="outline"
            className="h-auto max-w-full shrink-0 self-start rounded-full p-0"
          >
            <span className="flex max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-zinc-700 sm:text-xs">
              <StarIcon fill="currentColor" className="size-4 text-amber-400" />
              <span className="font-semibold tabular-nums">
                {food.feedback_rate ?? "—"}
              </span>
              <span className="text-zinc-500">
                ({food.feedback_count ?? 0} رأی) - ({food.comment_count ?? 0}{" "}
                نظر)
              </span>
            </span>
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
          {...food}
          day={day.day_name}
          jalali_date={day.jalali_date}
          date={day.date}
          isReserve={food.is_reserved}
          MaxQuantity={food.max_reservation_quantity}
          type={group.type}
          type_fa={group.type_fa || fallbackTypeTitle[group.type]}
          reservedFoodDay={day.reserved_food_day}
        />
        <Button
          variant="link"
          className="h-auto w-fit gap-1.5 p-0 text-(--base-green)"
          onClick={() => handleOpenModal(food.food_id)}
        >
          <MessageCircleIcon className="size-4" /> مشاهده نظرات
        </Button>
      </div>
      <div className="order-1 flex min-h-36 items-center justify-center bg-zinc-100 sm:order-2 sm:m-3 sm:aspect-square sm:min-h-0 sm:self-center sm:rounded-xl dark:bg-zinc-800">
        {food.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="aspect-[16/10] h-full w-full rounded-xl object-contain sm:aspect-square"
            src={food.image_url}
            alt={food.name}
            loading="lazy"
          />
        ) : (
          <UtensilsIcon className="size-10 text-zinc-300" aria-hidden="true" />
        )}
      </div>
    </article>
  );

  return (
    <>
      <FeedbackModal open={open} setOpen={setOpen} foodId={selectedFoodId} />
      <Tabs defaultValue={reserveList?.weeks[0]?.range} className="w-full rtl">
        <div className="flex flex-col gap-4">
          <TabsList className="rtl w-full bg-(--light-green)">
            {reserveList?.weeks.map((week) => (
              <TabsTrigger
                key={week.range}
                value={week.range}
                className="text-[12px] md:text-base"
              >
                {week.is_current_week
                  ? "هفته جاری"
                  : `${week.week_number} هفته بعد`}
              </TabsTrigger>
            ))}
          </TabsList>
          {reserveList?.weeks.map((week) => (
            <TabsContent key={week.range} value={week.range}>
              {week.reservation_message ? (
                <div className="mb-2 flex items-center gap-2 rounded-xl bg-(--light-green) p-4">
                  <InfoIcon className="size-5 text-red-600" />
                  <p className="text-red-600">{week.reservation_message}</p>
                </div>
              ) : null}
              <div className="flex flex-col gap-4 md:gap-6">
                {week.days.map((day) => {
                  const mainGroups = day.foods.filter(
                    ({ type }) =>
                      type === "breakfast" ||
                      type === "lunch" ||
                      type === "dinner",
                  );
                  const sideGroups = day.foods.filter(
                    ({ type }) => type === "drink" || type === "appetizer",
                  );
                  const hasMainFood =
                    day.reserved_food_day ||
                    reserveItems.some(
                      (cartItem) =>
                        cartItem.date === day.date &&
                        (!cartItem.type ||
                          cartItem.type === "breakfast" ||
                          cartItem.type === "lunch" ||
                          cartItem.type === "dinner"),
                    );
                  return (
                    <section
                      key={day.date}
                      className="flex flex-col gap-5 rounded-2xl border bg-white p-3 shadow-sm md:p-5 dark:bg-zinc-800"
                    >
                      <header className="flex items-center gap-3 text-lg">
                        <span className="h-8 w-0.5 bg-(--base-green)" />
                        <strong>{day.day_name}</strong>
                        <span>{day.jalali_date}</span>
                      </header>
                      {mainGroups.length ? (
                        mainGroups.map((group) => (
                          <div key={group.type} className="grid gap-3">
                            {mainGroups.length > 1 ? (
                              <h2 className="w-fit rounded-full bg-(--light-green) px-4 py-1.5 font-bold text-(--base-green)">
                                {group.type_fa || fallbackTypeTitle[group.type]}
                              </h2>
                            ) : null}
                            {group.items.map((food) =>
                              renderFood(food, group, day),
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="rounded-xl bg-zinc-50 p-5 text-center text-sm text-(--secondary-text)">
                          غذای اصلی برای این روز وجود ندارد
                        </div>
                      )}
                      {sideGroups.length ? (
                        <Collapsible
                          key={hasMainFood ? "main-selected" : "no-main"}
                          defaultOpen={hasMainFood}
                          className="group rounded-2xl border border-dashed border-(--base-green)/30 bg-(--light-green)/30"
                        >
                          <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-3 text-right md:p-4">
                            <span>
                              <span className="block font-bold">
                                مخلفات اختیاری
                              </span>
                              <span className="mt-1 block text-xs text-(--secondary-text)">
                                {hasMainFood
                                  ? "برای غذای اصلی این روز، مخلفات دلخواهتان را انتخاب کنید."
                                  : "برای مشاهده نوشیدنی‌ها و پیش‌غذاها کلیک کنید."}
                              </span>
                            </span>
                            <ChevronDownIcon className="size-5 shrink-0 text-(--base-green) transition-transform group-data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-3 pb-3 md:px-4 md:pb-4">
                            <div className="grid gap-5 border-t border-(--base-green)/15 pt-4">
                              {sideGroups.map((group) => (
                                <div key={group.type} className="grid gap-3">
                                  <h3 className="text-sm font-bold text-(--base-green)">
                                    {group.type_fa ||
                                      fallbackTypeTitle[group.type]}
                                  </h3>
                                  {group.items.map((food) =>
                                    renderFood(food, group, day),
                                  )}
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : null}
                    </section>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </>
  );
}

export default FoodReserveTabs;

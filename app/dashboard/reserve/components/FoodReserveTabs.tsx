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
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  InfoIcon,
  MessageCircleIcon,
  UtensilsIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import styles from "./FoodReserveTabs.module.css";
import { useSelector } from "react-redux";
import type {
  ReserveFoodType,
  ReserveFood,
  ReserveFoodGroup,
  ReserveDay,
  FoodReserveList,
  SelectedReserveFood,
} from "../types";
import FoodDetailsModal from "./FoodDetailsModal";
import FoodReserveInvoice from "./FoodReserveInvoice";
import { RatingStars } from "@/components/ui/rating-stars";

export type { FoodReserveList } from "../types";

const fallbackTypeTitle: Record<ReserveFoodType, string> = {
  breakfast: "صبحانه",
  lunch: "ناهار",
  dinner: "شام",
  drink: "نوشیدنی",
  appetizer: "پیش‌غذا",
};

// Keep sparse days aligned to the start and compact; use the menu's available width for dense days.
function foodGridClassName(count: number) {
  const base = "grid w-full grid-cols-2 gap-2 sm:gap-3";
  if (count === 1) return base + " xl:me-auto xl:ms-0 xl:max-w-72 xl:grid-cols-1";
  if (count === 2) return base + " xl:me-auto xl:ms-0 xl:max-w-[36rem]";
  if (count === 3) return base + " @min-[38rem]/foods:grid-cols-3 xl:mx-auto xl:max-w-[54rem]";
  return base + " @min-[38rem]/foods:grid-cols-3 @min-[52rem]/foods:grid-cols-4 xl:mx-auto xl:max-w-[72rem]";
}

function ReserveDaySection({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded} className="group/day overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-zinc-800">
      {trigger}
      <CollapsibleContent forceMount inert={!expanded} className={styles.dayPanel}>
        <div className={styles.dayContent}>
          <div className="min-h-0 overflow-hidden">
            <div className="space-y-3 p-2 sm:p-3">{children}</div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function FoodReserveTabs({
  reserveList,
}: {
  reserveList: FoodReserveList | null;
}) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<SelectedReserveFood | null>(null);
  const reserveItems = useSelector(reserveSelectItems);

  const handleOpenModal = (
    food: ReserveFood,
    group: ReserveFoodGroup,
    day: ReserveDay,
  ) => {
    setSelection({
      food,
      group: {
        ...group,
        type_fa: group.type_fa || fallbackTypeTitle[group.type],
      },
      day,
    });
    setOpen(true);
  };

  const renderFood = (
    food: ReserveFood,
    group: ReserveFoodGroup,
    day: ReserveDay,
  ) => (
    <article
      key={food.weekly_menu_id}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("button, a, input"))
          handleOpenModal(food, group, day);
      }}
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-zinc-50/70 p-2 transition-shadow hover:shadow-md dark:bg-zinc-900/50"
    >
      <button
        type="button"
        onClick={() => handleOpenModal(food, group, day)}
        aria-label={"مشاهده جزئیات " + food.name}
        aria-haspopup="dialog"
        className="relative aspect-square w-full cursor-pointer xl:aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 focus-visible:outline-2 focus-visible:outline-(--base-green) dark:bg-zinc-800"
      >
        {food.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="size-full object-cover"
            src={food.image_url}
            alt={food.name}
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <UtensilsIcon
              className="size-10 text-zinc-300"
              aria-hidden="true"
            />
          </div>
        )}
        {food.reserved_count > 0 ? (
          <span className="absolute inset-x-1 top-2 flex items-center justify-center gap-1 rounded-lg border border-(--base-green)/30 bg-background/95 px-1.5 py-1.5 text-[10px] font-semibold text-(--base-green) sm:text-xs">
            <CheckCircle2Icon className="size-4 shrink-0" aria-hidden="true" />
            از این غذا {food.reserved_count.toLocaleString("fa-IR")} عدد رزرو
            کرده‌اید
          </span>
        ) : null}
      </button>
      <div className="flex flex-1 flex-col gap-2 pt-3">
        <h3 className="min-h-12 text-sm font-bold leading-6 text-(--base-black) sm:text-base lg:text-lg">
          <button
            type="button"
            onClick={() => handleOpenModal(food, group, day)}
            className="cursor-pointer text-right focus-visible:outline-2 focus-visible:outline-(--base-green)"
            aria-haspopup="dialog"
          >
            {food.name}
          </button>
        </h3>
        {food.description ? (
          <p className="text-xs leading-5 text-(--secondary-text)">
            {food.description}
          </p>
        ) : null}
        <Button
          onClick={() => handleOpenModal(food, group, day)}
          variant="outline"
          aria-label={"مشاهده امتیاز و نظرات " + food.name}
          className="h-auto w-full min-w-0 rounded-full border-amber-200 bg-amber-50 px-1 py-1 text-zinc-700 dark:border-amber-200 dark:bg-amber-50 dark:text-zinc-700"
        >
          <span className="flex min-w-0 flex-wrap items-center justify-center gap-1 text-[10px] sm:text-xs">
            <RatingStars
              value={food.feedback_rate}
              starClassName="size-3 sm:size-4"
            />
            <span className="font-semibold tabular-nums">
              {food.feedback_rate ?? "—"}
            </span>
            <span className="text-zinc-500">
              ({food.feedback_count ?? 0} رأی) · ({food.comment_count ?? 0} نظر)
            </span>
          </span>
        </Button>
        <span className="text-sm font-semibold text-(--base-black) sm:text-base">
          {food.price.toLocaleString("fa-IR")} تومان
        </span>
        <div
          className="mt-auto pt-1"
          onClick={(event) => event.stopPropagation()}
        >
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
        </div>
        <Button
          variant="link"
          className="h-auto w-fit gap-1 p-0 text-[11px] text-(--base-green) sm:text-xs"
          onClick={() => handleOpenModal(food, group, day)}
        >
          <MessageCircleIcon className="size-3.5" /> مشاهده نظرات
        </Button>
      </div>
    </article>
  );

  return (
    <>
      <FoodDetailsModal open={open} setOpen={setOpen} selection={selection} />
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
              <p className="!mb-5 flex items-center justify-center gap-2 text-xs text-(--secondary-text) sm:text-sm">
                <CalendarDaysIcon
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
                {week.range}
              </p>
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
                    <ReserveDaySection key={day.date} trigger={

                      <CollapsibleTrigger className="flex w-full items-center gap-2 border-b bg-zinc-50 px-3 py-3 text-right text-sm sm:text-base dark:bg-zinc-800">
                        <span className="h-7 w-1 rounded-full bg-(--base-green)" />
                        <strong>{day.day_name}</strong>
                        <span>{day.jalali_date}</span>
                        <span className="mr-auto rounded-lg bg-zinc-100 px-2 py-1 text-[11px] dark:bg-zinc-700">
                          {mainGroups
                            .reduce(
                              (count, group) => count + group.items.length,
                              0,
                            )
                            .toLocaleString("fa-IR")}{" "}
                          غذا
                        </span>
                        <ChevronDownIcon className="size-4 shrink-0 text-(--base-green) transition-transform group-data-[state=open]/day:rotate-180" />
                      </CollapsibleTrigger>
                    }>
                        {mainGroups.length ? (
                          mainGroups.map((group) => (
                            <div key={group.type} className="@container/foods grid gap-3">
                              {mainGroups.length > 1 ? (
                                <h2 className="w-fit rounded-full bg-(--light-green) px-4 py-1.5 font-bold text-(--base-green)">
                                  {group.type_fa ||
                                    fallbackTypeTitle[group.type]}
                                </h2>
                              ) : null}
                              <div className={foodGridClassName(group.items.length)}>
                                {group.items.map((food) =>
                                  renderFood(food, group, day),
                                )}
                              </div>
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
                            className="group rounded-xl border border-(--base-green)/30 bg-(--light-green)/30"
                          >
                            <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-3 text-right md:p-4">
                              <span>
                                <span className="flex items-center gap-2 font-bold">
                                  <UtensilsIcon className="size-4 text-(--base-green)" />
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
                                  <div key={group.type} className="@container/foods grid gap-3">
                                    <h3 className="text-sm font-bold text-(--base-green)">
                                      {group.type_fa ||
                                        fallbackTypeTitle[group.type]}
                                    </h3>
                                    <div className={foodGridClassName(group.items.length)}>
                                      {group.items.map((food) =>
                                        renderFood(food, group, day),
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : null}
                    </ReserveDaySection>
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

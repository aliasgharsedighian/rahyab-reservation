"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { reserveSelectItems } from "@/redux/features/reserveBasketSlice";
import { CalendarDaysIcon, CheckCircle2Icon, ChevronDownIcon, InfoIcon, MessageCircleIcon, UtensilsIcon } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { hasMainFoodForDate, hasReservedMainFoodForDay } from "../cartRules";
import styles from "./FoodReserveTabs.module.css";
import type { ReserveFoodType, ReserveFood, ReserveFoodGroup, ReserveDay, FoodReserveList, SelectedReserveFood } from "../types";
import { RatingStars } from "@/components/ui/rating-stars";
import FoodReserveInvoice from "./FoodReserveInvoice";
import ReserveFoodImage from "./ReserveFoodImage";
import ReserveMenuWindow from "./ReserveMenuWindow";
import ReserveAnimatedPanel from "./ReserveAnimatedPanel";

export type { FoodReserveList } from "../types";

const FoodDetailsModal = dynamic(() => import("./FoodDetailsModal"), {
  loading: () => <div role="status" className="fixed inset-0 z-50 grid place-items-center bg-black/40"><p className="rounded-2xl bg-background p-6 text-foreground">در حال باز کردن جزئیات غذا...</p></div>,
});
const fallbackTypeTitle: Record<ReserveFoodType, string> = {
  breakfast: "صبحانه", lunch: "ناهار", dinner: "شام", drink: "نوشیدنی", appetizer: "پیش‌غذا",
};
type OpenFood = (food: ReserveFood, group: ReserveFoodGroup, day: ReserveDay) => void;
function foodGridClassName(count: number) {
  const base = "grid w-full grid-cols-2 gap-2 sm:gap-3";
  if (count === 1) return base + " xl:me-auto xl:ms-0 xl:max-w-72 xl:grid-cols-1";
  if (count === 2) return base + " xl:me-auto xl:ms-0 xl:max-w-[36rem]";
  if (count === 3) return base + " @min-[38rem]/foods:grid-cols-3 xl:mx-auto xl:max-w-[54rem]";
  return base + " @min-[38rem]/foods:grid-cols-3 @min-[52rem]/foods:grid-cols-4 xl:mx-auto xl:max-w-[72rem]";
}


const FoodCard = memo(function FoodCard({ food, group, day, reservedMain, onOpenFood }: {
  food: ReserveFood; group: ReserveFoodGroup; day: ReserveDay; reservedMain: boolean; onOpenFood: OpenFood;
}) {
  return (<article
      key={food.weekly_menu_id}
      onClick={(event) => {
        if (!(event.target as HTMLElement).closest("button, a, input"))
          onOpenFood(food, group, day);
      }}
      className="flex min-w-0 flex-col overflow-hidden rounded-xl border bg-zinc-50/70 p-2 transition-shadow hover:shadow-md dark:bg-zinc-900/50"
    >
      <button
        type="button"
        onClick={() => onOpenFood(food, group, day)}
        aria-label={"مشاهده جزئیات " + food.name}
        aria-haspopup="dialog"
        className="relative aspect-square w-full cursor-pointer xl:aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100 focus-visible:outline-2 focus-visible:outline-(--base-green) dark:bg-zinc-800"
      >
        {food.image_url ? (
          <ReserveFoodImage src={food.image_url} alt={food.name} sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 288px" />
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
            onClick={() => onOpenFood(food, group, day)}
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
          onClick={() => onOpenFood(food, group, day)}
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
            hasReservedMainFood={reservedMain}
          />
        </div>
        <Button
          variant="link"
          className="h-auto w-fit gap-1 p-0 text-[11px] text-(--base-green) sm:text-xs"
          onClick={() => onOpenFood(food, group, day)}
        >
          <MessageCircleIcon className="size-3.5" /> مشاهده نظرات
        </Button>
      </div>
    </article>);
});

const FoodGroup = memo(function FoodGroup({ group, day, reservedMain, onOpenFood, initial }: {
  group: ReserveFoodGroup; day: ReserveDay; reservedMain: boolean; onOpenFood: OpenFood; initial: boolean;
}) {
  const batches = useMemo(() => {
    const result: ReserveFood[][] = [];
    for (let index = 0; index < group.items.length; index += 12) result.push(group.items.slice(index, index + 12));
    return result;
  }, [group.items]);
  return <div className="space-y-2 sm:space-y-3">
    {batches.map((batch, index) => <ReserveMenuWindow key={batch[0].weekly_menu_id}
      count={batch.length} initial={initial && index === 0} className={foodGridClassName(group.items.length)}>
      <div className={foodGridClassName(group.items.length)}>
        {batch.map((food) => <FoodCard key={food.weekly_menu_id} food={food} group={group} day={day}
          reservedMain={reservedMain} onOpenFood={onOpenFood} />)}
      </div>
    </ReserveMenuWindow>)}
  </div>;
});

const FoodDay = memo(function FoodDay({ day, onOpenFood, initial }: {
  day: ReserveDay; onOpenFood: OpenFood; initial: boolean;
}) {
  const { mainGroups, sideGroups, reservedMain, count } = useMemo(() => {
    const mainGroups = day.foods.filter(({ type }) => type === "breakfast" || type === "lunch" || type === "dinner");
    return { mainGroups, sideGroups: day.foods.filter(({ type }) => type === "drink" || type === "appetizer"),
      reservedMain: hasReservedMainFoodForDay(day), count: mainGroups.reduce((total, group) => total + group.items.length, 0) };
  }, [day]);
  const hasMainFood = useSelector((state: Parameters<typeof reserveSelectItems>[0]) =>
    hasMainFoodForDate(reserveSelectItems(state), day.date, reservedMain));

  return <ReserveAnimatedPanel defaultOpen={true}
    className="group/day relative isolate overflow-clip rounded-xl border bg-white shadow-sm dark:bg-zinc-800"
    contentClassName="space-y-3 p-2 sm:p-3" trigger={
      <CollapsibleTrigger className={styles.dayHeader + " flex w-full items-center gap-2 rounded-t-xl border-b bg-zinc-50 px-3 py-3 text-right text-sm shadow-sm sm:text-base dark:bg-zinc-800"}>
        <span className="h-7 w-1 rounded-full bg-(--base-green)" />
        <strong>{day.day_name}</strong><span>{day.jalali_date}</span>
        <span className="mr-auto rounded-lg bg-zinc-100 px-2 py-1 text-[11px] dark:bg-zinc-700">{count.toLocaleString("fa-IR")} غذا</span>
        <ChevronDownIcon className="size-4 shrink-0 text-(--base-green) group-data-[state=open]/day:rotate-180" />
      </CollapsibleTrigger>
    }>
    {mainGroups.length ? mainGroups.map((group, index) => <div key={group.type} className="@container/foods grid gap-3">
      {mainGroups.length > 1 ? <h2 className="w-fit rounded-full bg-(--light-green) px-4 py-1.5 font-bold text-(--base-green)">{group.type_fa || fallbackTypeTitle[group.type]}</h2> : null}
      <FoodGroup group={group} day={day} reservedMain={reservedMain} onOpenFood={onOpenFood} initial={initial && index === 0} />
    </div>) : <div className="rounded-xl bg-zinc-50 p-5 text-center text-sm text-(--secondary-text)">غذای اصلی برای این روز وجود ندارد</div>}
    {sideGroups.length ? <ReserveAnimatedPanel key={hasMainFood ? "main-selected" : "no-main"} defaultOpen={hasMainFood}
      className="group rounded-xl border border-(--base-green)/30 bg-(--light-green)/30"
      contentClassName="px-3 pb-3 md:px-4 md:pb-4" trigger={
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 p-3 text-right md:p-4">
          <span><span className="flex items-center gap-2 font-bold"><UtensilsIcon className="size-4 text-(--base-green)" />مخلفات اختیاری</span>
          <span className="mt-1 block text-xs text-(--secondary-text)">{hasMainFood ? "برای غذای اصلی این روز، مخلفات دلخواهتان را انتخاب کنید." : "برای مشاهده نوشیدنی‌ها و پیش‌غذاها کلیک کنید."}</span></span>
          <ChevronDownIcon className="size-5 shrink-0 text-(--base-green) group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
      }>
      <div className="grid gap-5 border-t border-(--base-green)/15 pt-4">
        {sideGroups.map((group) => <div key={group.type} className="@container/foods grid gap-3">
          <h3 className="text-sm font-bold text-(--base-green)">{group.type_fa || fallbackTypeTitle[group.type]}</h3>
          <FoodGroup group={group} day={day} reservedMain={reservedMain} onOpenFood={onOpenFood} initial={false} />
        </div>)}
      </div>
    </ReserveAnimatedPanel> : null}
  </ReserveAnimatedPanel>;
});

function FoodReserveTabs({ reserveList }: { reserveList: FoodReserveList | null }) {
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<SelectedReserveFood | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(reserveList?.weeks[0]?.range);
  const week = reserveList?.weeks.find((item) => item.range === selectedWeek) ?? reserveList?.weeks[0];
  const onOpenFood = useCallback<OpenFood>((food, group, day) => {
    setSelection({ food, group: group.type_fa ? group : { ...group, type_fa: fallbackTypeTitle[group.type] }, day });
    setOpen(true);
  }, []);

  return <>
    {selection ? <FoodDetailsModal open={open} setOpen={setOpen} selection={selection} /> : null}
    <Tabs value={week?.range} onValueChange={setSelectedWeek} className="w-full rtl">
      <div className="flex flex-col gap-4">
        <TabsList className="rtl w-full bg-(--light-green)">
          {reserveList?.weeks.map((item) => <TabsTrigger key={item.range} value={item.range} className="text-[12px] md:text-base">
            {item.is_current_week ? "هفته جاری" : item.week_number + " هفته بعد"}
          </TabsTrigger>)}
        </TabsList>
        {week ? <TabsContent key={week.range} value={week.range}>
          <p className="!mb-5 flex items-center justify-center gap-2 text-xs text-(--secondary-text) sm:text-sm"><CalendarDaysIcon className="size-4 shrink-0" aria-hidden="true" />{week.range}</p>
          {week.reservation_message ? <div className="mb-2 flex items-center gap-2 rounded-xl bg-(--light-green) p-4"><InfoIcon className="size-5 text-red-600" /><p className="text-red-600">{week.reservation_message}</p></div> : null}
          <div className="flex flex-col gap-4 md:gap-6">
            {week.days.map((day, index) => <FoodDay key={day.date} day={day} onOpenFood={onOpenFood} initial={index === 0} />)}
          </div>
        </TabsContent> : null}
      </div>
    </Tabs>
  </>;
}

export default memo(FoodReserveTabs);

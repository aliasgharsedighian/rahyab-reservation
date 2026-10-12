"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BanknoteIcon, CheckCircle2Icon, UtensilsIcon, XIcon } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { RatingStars } from "@/components/ui/rating-stars";
import { Spinner } from "@/components/ui/spinner";
import type { FoodFeedbackData, SelectedReserveFood } from "../types";
import FoodReserveInvoice from "./FoodReserveInvoice";

interface FoodDetailsModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selection: SelectedReserveFood | null;
}

type FeedbackState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; data: FoodFeedbackData };

function FoodDetailsContent({ selection, isMobile }: { selection: SelectedReserveFood; isMobile: boolean }) {
  const { food, group, day } = selection;
  const [feedback, setFeedback] = useState<FeedbackState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadFeedback() {
      try {
        const { data, status } = await apiClient.get<{ data: FoodFeedbackData }>(
          "reservation-feedbacks/by-food",
          { params: { food_id: food.food_id }, signal: controller.signal },
        );
        if (status !== 200 || !data.data) throw new Error("Feedback request failed");
        if (!controller.signal.aborted) setFeedback({ status: "success", data: data.data });
      } catch {
        if (!controller.signal.aborted) setFeedback({ status: "error" });
      }
    }
    void loadFeedback();
    return () => controller.abort();
  }, [food.food_id, attempt]);

  const Title = isMobile ? DrawerTitle : DialogTitle;
  const data = feedback.status === "success" ? feedback.data : null;
  const imageUrl = food.image_url || data?.image_url;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-6 pt-3 sm:px-5">
      <div className="relative mb-3 flex aspect-[4/3] max-h-[45dvh] items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={food.name} className="size-full object-cover" />
        ) : <UtensilsIcon className="size-16 text-(--secondary-text)" aria-hidden="true" />}
        {food.reserved_count > 0 ? (
          <span className="absolute inset-x-1 top-2 flex items-center justify-center gap-1 rounded-lg border border-(--base-green)/30 bg-background/95 px-1.5 py-1.5 text-[10px] font-semibold text-(--base-green) sm:text-xs">
            <CheckCircle2Icon className="size-4 shrink-0" aria-hidden="true" />
            از این غذا {food.reserved_count.toLocaleString("fa-IR")} عدد رزرو کرده‌اید
          </span>
        ) : null}
      </div>
      <div className="space-y-4 rounded-2xl border bg-zinc-50/70 p-3 text-right dark:bg-zinc-900/50 sm:p-4">
        <Title className="text-xl font-bold leading-8 sm:text-2xl">{food.name}</Title>
        {food.description ? <p className="text-sm leading-7 text-(--secondary-text)">{food.description}</p> : null}
        <div className="flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-zinc-700">
          <RatingStars value={data?.feedback_rate ?? food.feedback_rate} />
          <span>{data?.feedback_rate ?? food.feedback_rate ?? "—"} ({data?.feedback_count ?? food.feedback_count} رأی)</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-(--base-green)/20 bg-(--light-green) p-4 font-bold">
          <BanknoteIcon className="size-5 text-(--base-green)" aria-hidden="true" />
          {food.price.toLocaleString("fa-IR")} تومان
        </div>
        <FoodReserveInvoice
          {...food}
          day={day.day_name}
          jalali_date={day.jalali_date}
          date={day.date}
          isReserve={food.is_reserved}
          MaxQuantity={food.max_reservation_quantity}
          type={group.type}
          type_fa={group.type_fa}
          reservedFoodDay={day.reserved_food_day}
          reserveLabel={"رزرو " + food.name}
        />
        <section aria-label="نظرات غذا" className="space-y-3 pt-2">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold">نظرات غذا</h3>
            <span className="flex items-center gap-2 text-xs text-(--secondary-text)">
              <RatingStars value={data?.feedback_rate ?? food.feedback_rate} />
              ({data?.comment_count ?? food.comment_count} نظر)
            </span>
          </header>
          {feedback.status === "loading" ? (
            <div role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-(--secondary-text)"><Spinner className="size-5 text-(--base-green)" />در حال بارگذاری نظرات...</div>
          ) : feedback.status === "error" ? (
            <div role="alert" className="space-y-2 rounded-xl border p-4 text-sm">
              <p>دریافت نظرات امکان‌پذیر نشد.</p>
              <Button variant="outline" onClick={() => { setFeedback({ status: "loading" }); setAttempt(value => value + 1); }}>تلاش دوباره</Button>
            </div>
          ) : feedback.data.feedbacks?.length ? feedback.data.feedbacks.map((item, index) => (
            <article key={index} className="space-y-3 rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <RatingStars value={item.rate} />
                <span className="text-xs text-(--secondary-text)">{item.created_day_name} · {item.created_at_jalali}</span>
              </div>
              {item.comment ? <p className="whitespace-pre-wrap break-words text-sm leading-7">{item.comment}</p> : null}
            </article>
          )) : <p className="rounded-xl border p-4 text-sm text-(--secondary-text)">نظری ثبت نشده است.</p>}
        </section>
        <p className="text-xs leading-6 text-(--secondary-text)">
          ثبت نظر فقط برای غذاهای رزرو شده توسط شما امکان‌پذیر است. برای ثبت نظر به <Link href="/dashboard/history-reserve?page=1" className="text-blue-600 underline">تاریخچه رزرو</Link> مراجعه کنید.
        </p>
      </div>
    </div>
  );
}

export default function FoodDetailsModal({ open, setOpen, selection }: FoodDetailsModalProps) {
  const isMobile = useIsMobile();
  const content = open && selection ? <FoodDetailsContent key={selection.food.weekly_menu_id} selection={selection} isMobile={isMobile} /> : null;
  if (isMobile) return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent dir="rtl" className="border border-(--base-green)/30 bg-white dark:bg-zinc-800 data-[vaul-drawer-direction=bottom]:h-[88dvh] data-[vaul-drawer-direction=bottom]:max-h-[88dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl">
        <DrawerDescription className="sr-only">جزئیات غذا، قیمت، رزرو و نظرات کاربران</DrawerDescription>
        <DrawerClose asChild><Button variant="ghost" size="icon" className="absolute left-3 top-2" aria-label="بستن جزئیات غذا"><XIcon className="size-5" /></Button></DrawerClose>
        <div className="h-5 shrink-0" />
        {content}
      </DrawerContent>
    </Drawer>
  );
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir="rtl" showCloseButton={false} className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden border border-(--base-green)/30 bg-white p-0 dark:bg-zinc-800 sm:max-w-2xl">
        <DialogDescription className="sr-only">جزئیات غذا، قیمت، رزرو و نظرات کاربران</DialogDescription>
        <div className="flex shrink-0 justify-end px-3 pt-2"><DialogClose asChild><Button variant="ghost" size="icon" aria-label="بستن جزئیات غذا"><XIcon className="size-5" /></Button></DialogClose></div>
        {content}
      </DialogContent>
    </Dialog>
  );
}

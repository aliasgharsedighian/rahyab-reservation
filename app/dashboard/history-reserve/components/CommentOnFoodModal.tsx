"use client";

import { apiClient } from "@/lib/api/client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { RatingStars } from "@/components/ui/rating-stars";
import type { ReservationFeedbackResponse } from "../types";
import type { FoodFeedbackData } from "../../reserve/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";

interface FeedbackState {
  has_feedback: boolean;
  rate: number | null;
  comment: string | null;
  status: string | null;
}

interface CommentOnFoodModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  foodId: number | null;
  reservationId: number | null;
  has_feedback?: FeedbackState;
  revalidateData: () => void | Promise<void>;
  onSubmitted?: () => void;
  promptMessage?: string;
}

function CommentOnFoodModal({
  open,
  setOpen,
  foodId,
  reservationId,
  has_feedback,
  revalidateData,
  onSubmitted,
  promptMessage,
}: CommentOnFoodModalProps) {
  const isMobile = useIsMobile();
  const [data, setData] = useState<FoodFeedbackData | null>(null);
  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(0);
  const [hoveredRate, setHoveredRate] = useState<number | null>(null);
  const [rateError, setRateError] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const { data: json } = await apiClient.get<{ data: FoodFeedbackData }>(
        `reservation-feedbacks/by-food?food_id=${foodId}`,
      );
      setData(json.data);
    } catch (err) {
      console.error(err);
    }
  }, [foodId]);

  // ✅ fetch data وقتی مودال باز میشه
  useEffect(() => {
    if (!open || !foodId) return;

    const timeout = window.setTimeout(() => {
      void fetchFeedbacks();
      setRate(has_feedback?.rate ?? 0);
      setRateError(false);
      setHoveredRate(null);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchFeedbacks, foodId, has_feedback?.rate, open]);

  // ✅ ثبت نظر
  const handleSubmit = async () => {
    if (rate === 0) {
      setRateError(true);
      toast.error("امتیاز خود را ثبت کنید");
      return;
    }

    try {
      const { data: response } = await apiClient.post<ReservationFeedbackResponse>(
        "reservation-feedbacks",
        {
          reservation_id: reservationId,
          rate,
          comment,
        },
      );

      if (response.status === 200) {
        setComment("");
        setRate(0);
        if (onSubmitted) {
          onSubmitted();
        } else {
          setOpen(false);
        }
        revalidateData();
        toast.success(response.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const Title = isMobile ? DrawerTitle : DialogTitle;
  const Description = isMobile ? DrawerDescription : DialogDescription;
  const statusLabels: Record<string, string> = {
    published: "منتشر شده",
    approved: "تأیید شده",
    pending: "در انتظار بررسی",
    rejected: "رد شده",
  };
  const feedbackStatus = has_feedback?.status;
  const statusLabel = feedbackStatus
    ? statusLabels[feedbackStatus] ?? feedbackStatus
    : "وضعیت نامشخص";

  const content = (
    <div className="space-y-4">
        <Title className="text-center iranSansBold text-xl">نظرات غذا</Title>
        <Description className="sr-only">امتیاز و نظر شما، وضعیت انتشار و نظرات کاربران دربارهٔ غذا</Description>

        {promptMessage && (
          <p className="text-center text-sm text-(--secondary-text)">
            {promptMessage}
          </p>
        )}

        {/* ✅ هدر غذا */}
        {data && (
          <div className="flex items-start gap-4 border p-3 rounded-xl">
            {data.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.image_url}
              alt={data.food_name}
              className="w-20 h-20 shrink-0 rounded-lg object-cover"
            />
            )}
            <div className="flex min-w-0 flex-col">
              <span className="font-bold text-lg">{data.food_name}</span>
              <span className="text-sm text-(--secondary-text) flex items-center gap-2">
                <RatingStars value={data.feedback_rate} />
                {data.feedback_rate} ({data.feedback_count} نظر)
              </span>
            </div>
          </div>
        )}

        {/* ✅ فرم ثبت نظر */}

        <div className="pt-4 space-y-3">
          <div
            className={`rounded-xl border p-4 ${
              rateError
                ? "border-red-500 bg-red-50/70 dark:bg-red-950/20"
                : "bg-muted/30"
            }`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-bold">
                  {has_feedback?.has_feedback
                    ? "امتیاز ثبت‌شده شما"
                    : "به این غذا چند امتیاز می‌دهید؟"}
                </p>
                <p className="mt-1 text-xs text-(--secondary-text)">
                  {has_feedback?.has_feedback
                    ? "این امتیاز قبلاً برای این رزرو ثبت شده است."
                    : "برای انتخاب امتیاز، روی یکی از ستاره‌ها بزنید."}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
                  rate > 0
                    ? "bg-amber-100 text-amber-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {rate > 0 ? `${rate} از ۵` : "انتخاب نشده"}
              </span>
            </div>

            {has_feedback?.has_feedback ? (
              <RatingStars
                value={rate}
                starClassName="size-8"
                label={`امتیاز ثبت‌شده ${rate} از ۵`}
              />
            ) : (
              <div
                className="flex w-fit gap-1 rounded-lg p-1"
                onMouseLeave={() => setHoveredRate(null)}
              >
                {[1, 2, 3, 4, 5].map((num) => {
                  const visibleRate = hoveredRate ?? rate;

                  return (
                    <button
                      type="button"
                      key={num}
                      aria-label={`${num} امتیاز از ۵`}
                      aria-pressed={rate === num}
                      onMouseEnter={() => setHoveredRate(num)}
                      onFocus={() => setHoveredRate(num)}
                      onBlur={() => setHoveredRate(null)}
                      onClick={() => {
                        setRate(num);
                        setRateError(false);
                      }}
                      className="group rounded-md p-1 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <StarIcon
                        className={`size-9 transition-colors ${
                          num <= visibleRate
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-muted-foreground/40 group-hover:text-amber-300"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {has_feedback?.has_feedback && (
              <div className="mt-3 space-y-3">
                {has_feedback.comment && (
                  <p className="whitespace-pre-wrap break-words text-sm leading-7">
                    {has_feedback.comment}
                  </p>
                )}
                <div className="space-y-1">
                  <p className="text-xs text-(--secondary-text)">وضعیت نظر</p>
                  <div className="rounded-lg border border-(--base-green)/25 bg-(--light-green) px-3 py-2 text-center text-sm font-bold" role="status" aria-label="وضعیت نظر">
                    {statusLabel}
                  </div>
                </div>
                <p className="text-center text-xs leading-6 text-(--secondary-text)">
                  شما قبلاً به این غذا نظر داده‌اید.
                </p>
              </div>
            )}

            {rateError && (
              <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                امتیاز خود را ثبت کنید.
              </p>
            )}
          </div>

          {!has_feedback?.has_feedback && (
            <>
              <Textarea
                placeholder="نظر خود را بنویسید..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button onClick={handleSubmit} className="w-full">
                ثبت نظر
              </Button>
            </>
          )}
        </div>
        {data && (
          <section aria-labelledby="other-food-feedback-title" className="space-y-3">
            <h3 id="other-food-feedback-title" className="font-bold">نظرات بقیه راجع به این غذا</h3>
            <div className="divide-y overflow-hidden rounded-xl border">
            {data.feedbacks?.length ? data.feedbacks.map((feedback, index) => (
              <article key={index} className="space-y-2 p-3 text-right">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <RatingStars value={feedback.rate} />
                  <span className="ms-auto text-left text-xs text-(--secondary-text)">
                    {feedback.created_day_name} · <bdi dir="ltr">{feedback.created_at_jalali}</bdi>
                  </span>
                </div>
                {feedback.comment && <p className="whitespace-pre-wrap break-words text-sm leading-7">{feedback.comment}</p>}
              </article>
            )) : <p className="p-3 text-sm text-(--secondary-text)">هنوز نظری ثبت نشده است.</p>}
            </div>
          </section>
        )}
    </div>
  );

  if (isMobile) return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent dir="rtl" className="border border-(--base-green)/30 data-[vaul-drawer-direction=bottom]:h-[88dvh] data-[vaul-drawer-direction=bottom]:max-h-[88dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl">
        <DrawerClose asChild>
          <Button variant="ghost" size="icon" className="absolute left-3 top-2" aria-label="بستن نظرات غذا"><XIcon className="size-5" /></Button>
        </DrawerClose>
        <div className="h-5 shrink-0" />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent dir="rtl" className="rtl max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        {content}
      </DialogContent>
    </Dialog>
  );
}

export default CommentOnFoodModal;

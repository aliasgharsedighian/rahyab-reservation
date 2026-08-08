"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StarIcon } from "lucide-react";
import { toast } from "sonner";

interface FeedbackState {
  has_feedback: boolean;
  rate: number | null;
  comment: string | null;
  status: string | null;
}

interface FoodFeedbackData {
  food_name: string;
  feedback_rate: number;
  feedback_count: number;
  image_url: string;
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
  const [data, setData] = useState<FoodFeedbackData | null>(null);
  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(0);
  const [hoveredRate, setHoveredRate] = useState<number | null>(null);
  const [rateError, setRateError] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservation-feedbacks/by-food?food_id=${foodId}`,
        { headers },
      );
      const json = (await res.json()) as { data: FoodFeedbackData };
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

    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservation-feedbacks`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            reservation_id: reservationId,
            rate,
            comment,
          }),
        },
      );

      const response = await res.json();

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rtl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center iranSansBold text-xl">
            نظرات غذا
          </DialogTitle>
        </DialogHeader>

        {promptMessage && (
          <p className="text-center text-sm text-(--secondary-text)">
            {promptMessage}
          </p>
        )}

        {/* ✅ هدر غذا */}
        {data && (
          <div className="flex items-start justify-between gap-4 border p-3 rounded-xl">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{data.food_name}</span>
              <span className="text-sm text-(--secondary-text) flex items-center gap-2">
                <StarIcon fill="#fbcb10" className="text-[#fbcb10]" />{" "}
                {data.feedback_rate} ({data.feedback_count} نظر)
              </span>
            </div>
            <img
              src={data.image_url}
              alt={data.food_name}
              className="w-20 h-20 rounded-lg object-cover"
            />
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
              <div
                className="flex gap-1"
                role="img"
                aria-label={`امتیاز ثبت‌شده ${rate} از ۵`}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <StarIcon
                    key={num}
                    className={`size-8 ${
                      num <= rate
                        ? "fill-amber-400 text-amber-400"
                        : "fill-transparent text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
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

            {rateError && (
              <p className="mt-2 text-sm font-medium text-red-600" role="alert">
                امتیاز خود را ثبت کنید.
              </p>
            )}
          </div>

          {/* ✅ textarea ثبت نظر */}
          {has_feedback?.has_feedback ? (
            <div className="flex flex-col gap-2">
              <p>شما قبلا به این غذا نظر داده اید:</p>
              <div className="border p-3 rounded-lg bg-(--light-green)">
                <p className="font-bold">نظر شما:</p>
                <p>{has_feedback.comment}</p>
              </div>
              <span className="text-sm">وضعیت: {has_feedback.status}</span>
            </div>
          ) : (
            <Textarea
              placeholder="نظر خود را بنویسید..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          )}

          {/* ✅ دکمه ثبت نظر */}
          {has_feedback?.has_feedback ? (
            <Button disabled>شما قبلا به این غذا نظر داده اید</Button>
          ) : (
            <Button onClick={handleSubmit} className="w-full">
              ثبت نظر
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommentOnFoodModal;

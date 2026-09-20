"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { DirectionProvider } from "@/components/ui/direction";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { RatingStars } from "@/components/ui/rating-stars";

interface FeedbackItem {
  rate: number | string;
  created_day_name: string;
  created_at_jalali: string;
  comment: string;
}

interface FeedbackData {
  food_name: string;
  feedback_rate: number | string;
  feedback_count: number;
  comment_count: number;
  image_url: string;
  feedbacks: FeedbackItem[];
}

interface FeedbackModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  foodId: number | null;
}

function FeedbackModal({ open, setOpen, foodId }: FeedbackModalProps) {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservation-feedbacks/by-food?food_id=${foodId}`,
        { headers },
      );
      const json = (await res.json()) as { data: FeedbackData };

      setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [foodId]);

  // ✅ fetch data وقتی مودال باز میشه
  useEffect(() => {
    if (!open || !foodId) return;

    const timeout = window.setTimeout(() => {
      void fetchFeedbacks();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchFeedbacks, foodId, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setData(null);
    }
    setOpen(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rtl max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center iranSansBold text-xl">
            نظرات غذا
          </DialogTitle>
        </DialogHeader>

        {loading || !data ? (
          <div
            className="flex min-h-64 flex-col items-center justify-center gap-3 text-(--secondary-text)"
            role="status"
            aria-live="polite"
          >
            <Spinner className="size-8 text-(--base-green)" />
            <p className="text-sm">در حال بارگذاری نظرات...</p>
          </div>
        ) : (
          <>
            {/* ✅ هدر غذا */}
            <div className="flex items-start justify-between gap-4 border p-3 rounded-xl">
              <div className="flex flex-col">
                <span className="font-bold text-lg">{data.food_name}</span>
                <span className="text-sm text-(--secondary-text) flex items-center gap-2">
                  <RatingStars value={data.feedback_rate} />
                  {data.feedback_rate} ({data.feedback_count} رای) - (
                  {data.comment_count} نظر)
                </span>
              </div>
              <img
                src={data.image_url}
                alt={data.food_name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            </div>

            {/* ✅ لیست نظرات */}
            <DirectionProvider dir="rtl">
              <ScrollArea className="h-auto max-h-[35vh] overflow-auto">
                <div
                  className={`space-y-2 ${data?.feedbacks?.length ? "border rounded-lg" : ""} `}
                >
                  {data?.feedbacks?.length ? (
                    data.feedbacks.map((item, index) => (
                      <div
                        key={index}
                        className=" p-3 border-b flex flex-col gap-1"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <RatingStars value={item.rate} />
                            {item.rate}
                          </span>
                          <span className="text-(--secondary-text)">
                            {item.created_day_name} - {item.created_at_jalali}
                          </span>
                        </div>

                        <p className="text-sm whitespace-break-spaces">
                          {item.comment}
                        </p>

                        {/* <span className="text-xs text-green-600">
                      {item.status}
                    </span> */}
                      </div>
                    ))
                  ) : (
                    <p>نظری ثبت نشده</p>
                  )}
                </div>
              </ScrollArea>
            </DirectionProvider>

            {/* ✅ فرم ثبت نظر */}
            <div className="text-sm">
              <p>ثبت نظر فقط برای غذاهای رزرو شده توسط شما امکان‌پذیر است.</p>
              <p>
                برای ثبت نظر میتوانید به صفحه{" "}
                <Link
                  href="/dashboard/history-reserve?page=1"
                  className="text-blue-600 iranSansBold text-sm"
                >
                  تاریخچه رزرو
                </Link>{" "}
                مراجعه کنید.
              </p>
            </div>
          </>
        )}
        {/* <div className="border-t pt-4 space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setRate(num)}
                className={`text-xl ${
                  num <= rate ? "text-yellow-400" : "text-muted-foreground"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <Textarea
            placeholder="نظر خود را بنویسید..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Button onClick={handleSubmit} className="w-full">
            ثبت نظر
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}

export default FeedbackModal;

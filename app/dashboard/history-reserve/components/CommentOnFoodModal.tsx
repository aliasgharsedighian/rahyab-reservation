"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DirectionProvider } from "@/components/ui/direction";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StarIcon } from "lucide-react";
import { toast } from "sonner";

function CommentOnFoodModal({ open, setOpen, foodId, reservationId }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(5);

  // ✅ fetch data وقتی مودال باز میشه
  useEffect(() => {
    if (open && foodId) {
      fetchFeedbacks();
    }
    if (!open) {
      setData([]);
    }
  }, [open, foodId]);

  const fetchFeedbacks = async () => {
    const token = localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);
    // console.log(foodId);
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservation-feedbacks/by-food?food_id=${foodId}`,
        {
          headers: myHeaders,
        },
      );
      const json = await res.json();

      setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ثبت نظر
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservation-feedbacks`,
        {
          method: "POST",
          headers: myHeaders,
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
        setRate(5);
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

        {/* ✅ هدر غذا */}
        {data && (
          <div className="flex items-start justify-between gap-4 border p-3 rounded-xl">
            <div className="flex flex-col">
              <span className="font-bold text-lg">{data.food_name}</span>
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <StarIcon fill="#fbcb10" className="text-[#fbcb10]" />{" "}
                {data.feedback_rate} ({data.feedback_count} نظر)
              </span>
            </div>
            <img
              src={data.image_url}
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
        )}

        {/* ✅ فرم ثبت نظر */}

        <div className="pt-4 space-y-3">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setRate(num)}
                className={`text-xl ${
                  num <= rate ? "text-yellow-400" : "text-gray-300"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommentOnFoodModal;

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FoodReserveInvoice from "./FoodReserveInvoice";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import FeedbackModal from "./FeedbackModal";
import { StarIcon } from "lucide-react";

function FoodReserveTabs({ reserveList }: any) {
  const [tab, setTab] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);

  const handleOpenModal = (foodId: number) => {
    setSelectedFoodId(foodId);
    setOpen(true);
  };

  return (
    <>
      <FeedbackModal open={open} setOpen={setOpen} foodId={selectedFoodId} />

      <Tabs
        onValueChange={(value) => {
          setTab(value);
        }}
        defaultValue={reserveList.weeks[0].range}
        className="w-full rtl"
      >
        <div className="flex flex-col gap-4">
          <TabsList className="rtl w-full bg-(--light-green)">
            {reserveList.weeks.map((item: any, index: number) => (
              <TabsTrigger key={index} value={item.range} className="">
                {item.is_current_week
                  ? "هفته جاری"
                  : `${item.week_number} هفته بعد `}
              </TabsTrigger>
            ))}
          </TabsList>

          {reserveList.weeks.map((item: any, index: number) => (
            <TabsContent key={index} value={item.range}>
              <div className="flex flex-col gap-4 md:gap-6">
                {item.days.map((day: any) => (
                  <div
                    key={day.date}
                    className="relative flex flex-col gap-2 border p-2 rounded-lg shadow-md"
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
                    <div className="flex flex-col items-start gap-2">
                      {day.foods.length !== 0 ? (
                        day.foods.map((food: any) => (
                          <div
                            key={food.food_id}
                            className="w-full flex flex-row gap-3 justify-between h-full items-start pb-4 border-b last:border-none pl-2"
                          >
                            <span className="absolute left-4 top-3 text-sm text-gray-500 flex items-center gap-2">
                              <StarIcon
                                fill="#fbcb10"
                                className="text-[#fbcb10] size-5"
                              />{" "}
                              {food.feedback_rate} ({food.feedback_count} نظر)
                            </span>
                            <div className="basis-1/2 h-full flex flex-col gap-2 justify-between">
                              <h3 className="text-lg font-bold text-(--base-black)">
                                {food.name}
                              </h3>
                              <p className="text-(--secondary-text)">
                                {food.description}
                              </p>
                              <span className="text-(--base-black) text-lg">
                                {food.price.toLocaleString()} تومان
                              </span>
                              <FoodReserveInvoice
                                food_id={food.food_id}
                                weekly_menu_id={food.weekly_menu_id}
                                name={food.name}
                                price={food.price}
                                day={day.day_name}
                                jalali_date={day.jalali_date}
                                date={day.date}
                              />
                              <Button
                                variant="link"
                                className="text-(--base-green) w-fit"
                                onClick={() => handleOpenModal(food.food_id)}
                              >
                                مشاهده نظرات
                              </Button>
                            </div>
                            <div className="basis-1/2 relative h-full">
                              <img
                                className="w-full h-full max-w-3xs rounded-2xl"
                                src={food.image_url}
                                alt={food.name}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div>غذایی برای این روز وجود ندارد</div>
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

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FoodReserveInvoice from "./FoodReserveInvoice";
import { useState } from "react";

function FoodReserveTabs({ reserveList }: any) {
  const [tab, setTab] = useState("");
  return (
    <Tabs
      onValueChange={(value) => {
        setTab(value);
      }}
      defaultValue={reserveList.weeks[0].range}
      className="w-full rtl"
    >
      <div className="flex flex-col gap-4">
        <TabsList className="rtl w-full">
          {reserveList.weeks.map((item: any, index: number) => (
            <TabsTrigger key={index} value={item.range}>
              {item.is_current_week
                ? "هفته جاری"
                : `${item.week_number} هفته بعد `}
            </TabsTrigger>
          ))}
        </TabsList>

        {reserveList.weeks.map((item: any, index: number) => (
          <TabsContent key={index} value={item.range}>
            <div className="flex flex-col gap-3">
              {item.days.map((day: any) => (
                <div
                  key={day.date}
                  className="flex flex-col gap-2 border-b pb-4 last:border-none"
                >
                  <div className="relative flex items-center gap-3">
                    <span className="h-7 w-0.5 bg-zinc-900"></span>
                    <p className="text-lg font-IRANSansBold">{day.day_name}</p>
                    <span>{day.jalali_date}</span>
                  </div>
                  <div className="flex flex-col md:flex-row items-start gap-2">
                    {day.foods.length !== 0 ? (
                      day.foods.map((food: any) => (
                        <div
                          key={food.food_id}
                          className="flex flex-col gap-1 justify-between h-full items-start border-l last:border-none pl-2"
                        >
                          <div className="relative h-full">
                            <img
                              className="w-full max-w-3xs rounded-2xl"
                              src={food.image_url}
                              alt={food.name}
                            />
                            <span className="absolute p-1 rounded-md right-1 top-1 bg-white">
                              {food.price.toLocaleString()} تومان
                            </span>
                          </div>
                          <p>{food.name}</p>
                          <p>{food.description}</p>
                          <FoodReserveInvoice
                            food_id={food.food_id}
                            weekly_menu_id={food.weekly_menu_id}
                            name={food.name}
                            price={food.price}
                            day={day.day_name}
                            jalali_date={day.jalali_date}
                            date={day.date}
                          />
                        </div>
                      ))
                    ) : (
                      <div>غذایی برای این روز از طرف شرکت انتخاب نشده است</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}

export default FoodReserveTabs;

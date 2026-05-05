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
                  className="flex flex-col gap-2 border p-2 rounded-lg shadow-md"
                >
                  <div className="text-lg relative flex items-center gap-3">
                    <span className="h-8 w-0.5 bg-(--base-green)"></span>
                    <p className="text-(--base-black) font-bold">
                      {day.day_name}
                    </p>
                    <span>{day.jalali_date}</span>
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    {day.foods.length !== 0 ? (
                      day.foods.map((food: any) => (
                        <div
                          key={food.food_id}
                          className="w-full flex flex-row gap-3 justify-between h-full items-start pb-4 border-b last:border-none pl-2"
                        >
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
  );
}

export default FoodReserveTabs;

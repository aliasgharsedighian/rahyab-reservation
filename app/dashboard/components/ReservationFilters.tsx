"use client";

import { X } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useReservationFilters } from "../hook/useReservationFilters";
import DateFilter from "./DateFilter";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

type DateFilterKey = "reserve_date_from_jalali" | "reserve_date_to_jalali";

export default function ReservationFilters() {
  const { searchParams, updateFilter, clearFilters } = useReservationFilters();
  const [foodName, setFoodName] = useState(searchParams.get("food_name") || "");
  const [dateError, setDateError] = useState<string | null>(null);

  const debouncedFoodSearch = useDebouncedCallback((value: string) => {
    updateFilter("food_name", value.trim() || null);
  }, 1000);

  const handleFoodNameChange = (value: string) => {
    setFoodName(value);
    debouncedFoodSearch(value);
  };

  const handleDateChange = (key: DateFilterKey, value: string | null) => {
    const fromDate =
      key === "reserve_date_from_jalali"
        ? value
        : searchParams.get("reserve_date_from_jalali");
    const toDate =
      key === "reserve_date_to_jalali"
        ? value
        : searchParams.get("reserve_date_to_jalali");

    if (fromDate && toDate && fromDate > toDate) {
      setDateError(
        "بازه تاریخ نامعتبر است؛ «از تاریخ» نمی‌تواند بعد از «تا تاریخ» باشد.",
      );
      return;
    }

    setDateError(null);
    updateFilter(key, value);
  };

  const handleClearFilters = () => {
    debouncedFoodSearch.cancel();
    setFoodName("");
    setDateError(null);
    clearFilters();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="text-lg iranSansBold flex justify-between w-full items-center">
        <p>فیلترها</p>
        <div className="flex items-end">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClearFilters}
          >
            <X className="w-4 h-4 ml-2" />
            حذف فیلترها
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-2">
            <label className="text-sm">نام غذا</label>

            <Input
              placeholder="جستجو نام غذا..."
              value={foodName}
              onChange={(event) => handleFoodNameChange(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-4 items-center">
              <DateFilter
                label="از تاریخ"
                value={searchParams.get("reserve_date_from_jalali")}
                onChange={(value) =>
                  handleDateChange("reserve_date_from_jalali", value)
                }
              />

              <DateFilter
                label="تا تاریخ"
                value={searchParams.get("reserve_date_to_jalali")}
                onChange={(value) =>
                  handleDateChange("reserve_date_to_jalali", value)
                }
              />
            </div>
            {dateError && (
              <p role="alert" className="text-sm leading-6 text-destructive">
                {dateError}
              </p>
            )}
          </div>

          {/* <div>
            <label className="text-sm mb-2 block">روزهای هفته</label>

            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <Badge
                  key={day}
                  variant={selectedDays.includes(day) ? "default" : "outline"}
                  className="cursor-pointer py-2 px-3"
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </Badge>
              ))}
            </div>
          </div> */}

          <div>
            <label className="text-sm mb-2 block">لغو شده ها</label>

            <Switch
              className="ltr"
              checked={searchParams.get("status") === "cancelled"}
              onCheckedChange={(checked) =>
                updateFilter("status", checked ? "cancelled" : null)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

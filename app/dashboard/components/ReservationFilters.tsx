"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useReservationFilters } from "../hook/useReservationFilters";
import DateFilter from "./DateFilter";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import ResponsiveFilters from "./ResponsiveFilters";

type DateFilterKey = "reserve_date_from_jalali" | "reserve_date_to_jalali";

export default function ReservationFilters() {
  const { searchParams, updateFilter, clearFilters } = useReservationFilters();
  const [foodName, setFoodName] = useState(searchParams.get("food_name") || "");
  const [dateError, setDateError] = useState<string | null>(null);
  const activeCount = [
    "food_name",
    "reserve_date_from_jalali",
    "reserve_date_to_jalali",
    "status",
  ].filter((key) => searchParams.has(key)).length;

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
    <ResponsiveFilters
      activeCount={activeCount}
      onClear={handleClearFilters}
      description="جستجو را بر اساس نام غذا، بازه تاریخ یا وضعیت محدود کنید."
    >
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex min-w-0 flex-col gap-2">
            <label className="text-sm font-medium">نام غذا</label>

            <Input
              className="h-10 rounded-xl bg-background"
              placeholder="نام غذا را جستجو کنید..."
              value={foodName}
              onChange={(event) => handleFoodNameChange(event.target.value)}
            />
          </div>
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

          <div className="flex min-h-10 items-center justify-between rounded-xl border bg-background px-3 py-2">
            <div>
              <p className="text-sm font-medium">فقط لغوشده‌ها</p>
              <p className="text-[11px] text-muted-foreground">نمایش رزروهای لغوشده</p>
            </div>
            <Switch
              dir="ltr"
              checked={searchParams.get("status") === "cancelled"}
              onCheckedChange={(checked) =>
                updateFilter("status", checked ? "cancelled" : null)
              }
            />
          </div>
        </div>
        {dateError && (
          <p role="alert" className="mt-3 text-sm leading-6 text-destructive">
            {dateError}
          </p>
        )}
    </ResponsiveFilters>
  );
}

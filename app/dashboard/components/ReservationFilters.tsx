"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useReservationFilters } from "../hook/useReservationFilters";
import DateFilter from "./DateFilter";
import { Search } from "lucide-react";
import { useId, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import ResponsiveFilters from "./ResponsiveFilters";

type DateFilterKey = "reserve_date_from_jalali" | "reserve_date_to_jalali";

export default function ReservationFilters({ compact = true }: { compact?: boolean } = {}) {
  const foodNameId = useId();
  const { searchParams, updateFilter, clearFilters } = useReservationFilters();
  const foodNameQuery = searchParams.get("food_name") || "";
  const [foodName, setFoodName] = useState(foodNameQuery);
  const [previousFoodNameQuery, setPreviousFoodNameQuery] = useState(foodNameQuery);

  // Keep the search draft in sync when filters are cleared outside the dialog.
  if (previousFoodNameQuery !== foodNameQuery) {
    setPreviousFoodNameQuery(foodNameQuery);
    setFoodName(foodNameQuery);
  }
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
      compact={compact}
      activeCount={activeCount}
      onClear={handleClearFilters}
      description="جستجو را بر اساس نام غذا، بازه تاریخ یا وضعیت محدود کنید."
    >
        <div className={compact ? "grid grid-cols-2 items-end gap-3" : "grid grid-cols-1 items-end gap-4 md:grid-cols-2 xl:grid-cols-4"}>
          <div className={compact ? "relative col-span-2 min-w-0" : "flex min-w-0 flex-col gap-2"}>
            <label htmlFor={foodNameId} className={compact ? "sr-only" : "text-sm font-medium"}>نام غذا</label>
            {compact && <Search className="pointer-events-none absolute right-3 top-3 size-4 text-(--secondary-text)" aria-hidden="true" />}

            <Input
              id={foodNameId}
              className={compact ? "h-11 rounded-lg bg-muted/50 pr-10" : "h-10 rounded-xl bg-background"}
              placeholder={compact ? "نام غذا" : "نام غذا را جستجو کنید..."}
              value={foodName}
              onChange={(event) => handleFoodNameChange(event.target.value)}
            />
          </div>
          <DateFilter
            compact={compact}
            label="از تاریخ"
            value={searchParams.get("reserve_date_from_jalali")}
            onChange={(value) =>
              handleDateChange("reserve_date_from_jalali", value)
            }
          />
          <DateFilter
            compact={compact}
            label="تا تاریخ"
            value={searchParams.get("reserve_date_to_jalali")}
            onChange={(value) =>
              handleDateChange("reserve_date_to_jalali", value)
            }
          />

          <div className={compact ? "col-span-2 flex min-h-16 items-center justify-between gap-3 rounded-lg border px-3 py-3" : "flex min-h-10 items-center justify-between rounded-xl border bg-background px-3 py-2"}>
            <div>
              <p id={foodNameId + "-cancelled-label"} className="text-sm font-medium">فقط لغوشده‌ها</p>
              <p className="text-[11px] text-muted-foreground">نمایش رزروهای لغوشده</p>
            </div>
            <Switch
              dir="ltr"
              aria-labelledby={foodNameId + "-cancelled-label"}
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

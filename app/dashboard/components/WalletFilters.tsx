"use client";

import { useReservationFilters } from "../hook/useReservationFilters";
import DateFilter from "./DateFilter";
import { useState } from "react";
import ResponsiveFilters from "./ResponsiveFilters";

type WalletDateFilterKey =
  | "created_at_from_jalali"
  | "created_at_to_jalali";

export default function WalletFilters() {
  const { searchParams, updateFilter, clearFilters } = useReservationFilters();
  const [dateError, setDateError] = useState<string | null>(null);
  const activeCount = [
    "created_at_from_jalali",
    "created_at_to_jalali",
    "status",
  ].filter((key) => searchParams.has(key)).length;

  const handleDateChange = (
    key: WalletDateFilterKey,
    value: string | null,
  ) => {
    const fromDate =
      key === "created_at_from_jalali"
        ? value
        : searchParams.get("created_at_from_jalali");
    const toDate =
      key === "created_at_to_jalali"
        ? value
        : searchParams.get("created_at_to_jalali");

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
    setDateError(null);
    clearFilters();
  };

  return (
    <ResponsiveFilters
      activeCount={activeCount}
      onClear={handleClearFilters}
      description="تراکنش‌ها را در یک بازه زمانی مشخص مشاهده کنید."
    >
        <div className="grid grid-cols-1 gap-4 md:max-w-2xl md:grid-cols-2">
          <DateFilter
            label="از تاریخ"
            value={searchParams.get("created_at_from_jalali")}
            onChange={(value) =>
              handleDateChange("created_at_from_jalali", value)
            }
          />
          <DateFilter
            label="تا تاریخ"
            value={searchParams.get("created_at_to_jalali")}
            onChange={(value) =>
              handleDateChange("created_at_to_jalali", value)
            }
          />
        </div>
        {dateError && (
          <p role="alert" className="mt-3 text-sm leading-6 text-destructive">
            {dateError}
          </p>
        )}
    </ResponsiveFilters>
  );
}

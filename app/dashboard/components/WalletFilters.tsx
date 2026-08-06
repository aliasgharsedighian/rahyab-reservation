"use client";

import { X } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useReservationFilters } from "../hook/useReservationFilters";
import DateFilter from "./DateFilter";
import { useState } from "react";

type WalletDateFilterKey =
  | "created_at_from_jalali"
  | "created_at_to_jalali";

export default function WalletFilters() {
  const { searchParams, updateFilter, clearFilters } = useReservationFilters();
  const [dateError, setDateError] = useState<string | null>(null);

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
            <div className="flex flex-wrap gap-4 items-center">
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

          {/* <div>
            <label className="text-sm mb-2 block">لغو شده ها</label>

            <Switch
              checked={searchParams.get("status") === "cancelled"}
              onCheckedChange={(checked) =>
                updateFilter("status", checked ? "cancelled" : null)
              }
            />
          </div> */}
        </div>
      </CardContent>
    </Card>
  );
}

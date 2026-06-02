"use client";

import { CalendarIcon, X } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useReservationFilters } from "../hook/useReservationFilters";
import DateFilter from "./DateFilter";

const DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
];

export default function ReservationFilters() {
  const { searchParams, updateFilter, clearFilters } = useReservationFilters();

  const selectedDays =
    searchParams.get("days")?.split(",").filter(Boolean) || [];

  const toggleDay = (day: string) => {
    const updated = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];

    updateFilter("days", updated.length ? updated.join(",") : null);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="text-lg iranSansBold">فیلترها</CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label className="text-sm mb-2 block">نام غذا</label>

            <Input
              placeholder="جستجو نام غذا..."
              defaultValue={searchParams.get("food_name") || ""}
              onChange={(e) => updateFilter("food_name", e.target.value)}
            />
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
              checked={searchParams.get("status") === "cancelled"}
              onCheckedChange={(checked) =>
                updateFilter("status", checked ? "cancelled" : null)
              }
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DateFilter
              label="از تاریخ"
              value={searchParams.get("reserve_date_from_jalali")}
              onChange={(value: any) =>
                updateFilter("reserve_date_from_jalali", value)
              }
            />

            <DateFilter
              label="تا تاریخ"
              value={searchParams.get("reserve_date_to_jalali")}
              onChange={(value: any) =>
                updateFilter("reserve_date_to_jalali", value)
              }
            />
          </div>

          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={clearFilters}>
              <X className="w-4 h-4 ml-2" />
              حذف فیلترها
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import DatePicker from "react-multi-date-picker";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type Props = {
  value: string | null;
  label: string;
  onChange: (value: string | null) => void;
};

export default function DateFilter({ value, label, onChange }: Props) {
  const toEnglishDigits = (value: string) =>
    value.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      <DatePicker
        style={{ height: 32 }}
        value={value || ""}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        onChange={(date) => {
          if (!date) {
            onChange(null);
            return;
          }

          const formatted = toEnglishDigits(date.format("YYYY/MM/DD"));

          onChange(formatted);
        }}
      />
    </div>
  );
}

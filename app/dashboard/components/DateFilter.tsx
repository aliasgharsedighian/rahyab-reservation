"use client";

import { CalendarDays } from "lucide-react";
import { useCallback, useId, useState } from "react";
import DatePicker from "react-multi-date-picker";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

type Props = {
  compact?: boolean;
  value: string | null;
  label: string;
  onChange: (value: string | null) => void;
};

export default function DateFilter({ value, label, onChange, compact = false }: Props) {
  const inputId = useId();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | undefined>();
  const attachContainer = useCallback((node: HTMLDivElement | null) => {
    setPortalTarget(node?.closest<HTMLElement>('[role="dialog"]') ?? undefined);
  }, []);
  const toEnglishDigits = (value: string) =>
    value.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());

  return (
    <div ref={compact ? attachContainer : undefined} className="relative flex w-full min-w-0 flex-col gap-2">
      <label htmlFor={inputId} className={compact ? "sr-only" : "text-sm font-medium"}>{label}</label>
      {compact && <CalendarDays className="pointer-events-none absolute left-3 top-3 z-1 size-4 text-(--secondary-text)" aria-hidden="true" />}

      <DatePicker
        portal={compact}
        portalTarget={portalTarget}
        zIndex={60}
        id={inputId}
        placeholder={compact ? label : undefined}
        inputClass={compact ? "text-right text-sm outline-none focus:ring-2 focus:ring-ring" : undefined}
        style={{
          height: compact ? 44 : 40,
          width: "100%",
          borderRadius: compact ? 8 : 12,
          border: "1px solid var(--border)",
          paddingInline: 12,
          paddingLeft: compact ? 36 : 12,
          background: compact ? "color-mix(in srgb, var(--muted) 50%, transparent)" : "var(--background)",
        }}
        containerClassName="w-full"
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

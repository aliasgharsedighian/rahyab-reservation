"use client";

import { CalendarDays, XIcon } from "lucide-react";
import { useCallback, useId, useState } from "react";
import DatePicker, { Calendar, type DateObject } from "react-multi-date-picker";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { toEnglishDigits } from "@/lib/digits";
import styles from "./DateFilter.module.css";

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
  const isMobile = useIsMobile();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | undefined>();
  const attachContainer = useCallback((node: HTMLDivElement | null) => {
    setPortalTarget(node?.closest<HTMLElement>('[role="dialog"]') ?? undefined);
  }, []);
  const handleDateChange = (date: DateObject | null) => {
    onChange(date ? toEnglishDigits(date.format("YYYY/MM/DD")) : null);
  };
  const displayValue = value?.replace(/[0-9]/g, digit => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);

  return (
    <div ref={compact ? attachContainer : undefined} className="relative flex w-full min-w-0 flex-col gap-2">
      <label htmlFor={inputId} className={compact ? "sr-only" : "text-sm font-medium"}>{label}</label>
      {compact && <CalendarDays className="pointer-events-none absolute left-3 top-3 z-1 size-4 text-(--secondary-text)" aria-hidden="true" />}

      {isMobile ? (
        <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
          <DialogTrigger asChild>
            <Button
              id={inputId}
              type="button"
              variant="outline"
              aria-label={label + (displayValue ? "، " + displayValue : "")}
              className={compact ? "h-11 w-full justify-start rounded-lg bg-muted/50 pl-9 text-right text-sm font-normal" : "h-10 w-full justify-start rounded-xl bg-background text-right font-normal"}
            >
              {displayValue || <span className="text-muted-foreground">{label}</span>}
            </Button>
          </DialogTrigger>
          <DialogContent
            dir="rtl"
            showCloseButton={false}
            className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm flex-col gap-4 overflow-y-auto overscroll-contain rounded-2xl p-4"
          >
            <div className="flex shrink-0 items-center justify-between gap-3">
              <DialogTitle className="flex items-center gap-2 text-base font-bold"><CalendarDays className="size-5 text-(--base-green)" aria-hidden="true" />{label}</DialogTitle>
              <DialogClose asChild><Button type="button" variant="ghost" size="icon" aria-label="بستن تقویم"><XIcon className="size-5" /></Button></DialogClose>
            </div>
            <DialogDescription className="text-right text-xs leading-6">روز موردنظر را از تقویم انتخاب کنید.</DialogDescription>
            <div className={styles.calendar}>
              <Calendar
                value={value || ""}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD"
                onChange={date => {
                  handleDateChange(date);
                  setCalendarOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      ) : <DatePicker
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
        onChange={handleDateChange}
      />}
    </div>
  );
}

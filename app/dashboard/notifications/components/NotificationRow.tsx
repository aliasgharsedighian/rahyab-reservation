import { Bell, ChevronLeft, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "../types";

export default function NotificationRow({ item, seen, onOpen }: {
  item: NotificationItem;
  seen: boolean;
  onOpen: () => void;
}) {
  return (
    <button type="button" onClick={onOpen} className={cn(
      "flex w-full items-start gap-3 px-3 py-3.5 text-right transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4",
      !seen && "bg-(--light-green)/45",
    )}>
      <span className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl",
        seen ? "bg-muted text-muted-foreground" : "bg-(--light-green) text-(--base-green)",
      )}>
        <Bell className="size-4" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className={cn("line-clamp-2 text-sm leading-6 [overflow-wrap:anywhere]", !seen && "font-bold")}>{item.body}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3 shrink-0" aria-hidden="true" />
            <bdi dir="ltr">{item.created_at}</bdi>
          </span>
          {seen ? <span>خوانده‌شده</span> : (
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <span className="size-1.5 rounded-full bg-(--base-green)" aria-hidden="true" />
              خوانده‌نشده
            </span>
          )}
        </span>
      </span>
      <ChevronLeft className="mt-2 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    </button>
  );
}

"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bell, ChevronLeft, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "../../context/NotificationContext";
import { useNotificationSetup } from "../../context/NotificationSetupContext";
import NotificationDetails from "./NotificationDetails";
import NotificationRow from "./NotificationRow";
import type { NotificationItem } from "../types";

export default function NotificationBell() {
  const { preview, unreadCount, seenIds, getNotifications, markSeenNotification } = useNotifications();
  const { pushStatus, showPushOffer } = useNotificationSetup();
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationItem | null>(null);
  const bell = useRef<HTMLButtonElement>(null);
  const count = unreadCount.toLocaleString("fa-IR");

  const openDetails = (item: NotificationItem) => {
    setSelected(item);
    setDetailsOpen(true);
    setOpen(false);
    if (!item.seen && !seenIds.has(item.id)) void markSeenNotification(item.id);
  };

  return (
    <>
      <Popover open={open} onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen && pushStatus === "ready" && Notification.permission === "default") showPushOffer();
      }}>
        <PopoverTrigger asChild>
          <Button ref={bell} type="button" variant="ghost" size="icon" className="relative" aria-label={unreadCount ? `اعلان‌ها، ${count} خوانده‌نشده` : "اعلان‌ها"}>
            <Bell className="size-5 text-(--base-green)" aria-hidden="true" />
            {unreadCount > 0 && (
              <span aria-hidden="true" className="absolute -right-1 -top-1 min-w-4 rounded-full bg-(--base-green) px-1 text-center text-[10px] leading-4 font-bold text-black">
                {unreadCount > 9 ? <bdi dir="ltr">۹+</bdi> : count}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent dir="rtl" aria-label="اعلان‌های اخیر" sideOffset={10} collisionPadding={12}
          onCloseAutoFocus={(event) => { if (detailsOpen) event.preventDefault(); }}
          className="w-[min(23rem,calc(100vw-1.5rem))] max-h-(--radix-popover-content-available-height) gap-0 overflow-hidden rounded-2xl p-0 shadow-xl">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
            <h2 className="text-sm font-bold">اعلان‌های اخیر</h2>
            {unreadCount > 0 && (
              <span className="rounded-full bg-(--light-green) px-2.5 py-1 text-xs text-foreground">{count} خوانده‌نشده</span>
            )}
          </div>
          <div className="min-h-0 max-h-80 overflow-y-auto overscroll-contain">
            {preview.state === "loading" && preview.items.length === 0 && (
              <div role="status" className="space-y-4 p-4">
                <span className="sr-only">در حال دریافت اعلان‌ها</span>
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} aria-hidden="true" className="flex items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {preview.state === "error" && (
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <p role="status" className="text-xs text-muted-foreground">دریافت اعلان‌های اخیر انجام نشد.</p>
                <Button type="button" size="sm" variant="outline" onClick={() => void getNotifications()}>تلاش دوباره</Button>
              </div>
            )}
            {preview.state === "ready" && preview.items.length === 0 && (
              <div className="grid justify-items-center gap-2 p-6 text-center">
                <Inbox className="size-6 text-muted-foreground" aria-hidden="true" />
                <p className="font-medium">هنوز اعلانی ندارید</p>
                <p className="text-xs leading-6 text-muted-foreground">پیام‌ها و وضعیت رزروها اینجا نمایش داده می‌شوند.</p>
              </div>
            )}
            {preview.items.length > 0 && (
              <ul className="divide-y divide-border">
                {preview.items.map((item) => (
                  <li key={item.id}>
                    <NotificationRow item={item} seen={item.seen || seenIds.has(item.id)} onOpen={() => openDetails(item)} />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="shrink-0 border-t p-2">
            <Button variant="ghost" asChild className="w-full justify-between">
              <Link href="/dashboard/notifications?page=1" onClick={() => setOpen(false)}>
                مشاهده همه اعلان‌ها <ChevronLeft aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      <NotificationDetails
        notification={selected}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onCloseAutoFocus={() => bell.current?.focus()}
      />
    </>
  );
}

"use client";

import { BellIcon, CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import type { NotificationItem } from "../types";
import { useEffect, useMemo } from "react";
import { createMessageDisplay, recordMessageInteraction, recordMessageShown, type MessageDisplay } from "@/lib/notification-analytics";

function MessageShownTracker({ display, open }: { display: MessageDisplay; open: boolean }) {
  useEffect(() => {
    if (!open) return;
    const record = () => {
      if (document.visibilityState === "visible") recordMessageShown(display);
    };
    record();
    document.addEventListener("visibilitychange", record);
    return () => document.removeEventListener("visibilitychange", record);
  }, [display, open]);
  return null;
}

interface Props {
  notification: NotificationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationDetails({ notification, open, onOpenChange }: Props) {
  const isMobile = useIsMobile();
  const messageId = notification?.id ?? null;
  const display = useMemo(() => ({
    open,
    message: messageId === null ? null : createMessageDisplay(messageId),
  }), [open, messageId]);
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && open && display.message) recordMessageInteraction(display.message, "dismissed");
    onOpenChange(nextOpen);
  };
  const Title = isMobile ? DrawerTitle : DialogTitle;
  const Description = isMobile ? DrawerDescription : DialogDescription;
  const content = (
    <>
      {display.message && notification && <MessageShownTracker display={display.message} open={display.open} />}
      <div className="flex shrink-0 items-center gap-3 border-b border-border p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-(--light-green) text-(--base-green)"><BellIcon className="size-5" /></span>
        <div className="min-w-0 flex-1 space-y-1.5 text-right">
          <Title className="text-lg font-bold">جزئیات اعلان</Title>
          <Description className="text-xs text-(--secondary-text)">پیام‌ها و اطلاع‌رسانی‌های حساب شما</Description>
        </div>
        <Button variant="ghost" size="icon-sm" aria-label="بستن جزئیات اعلان" onClick={() => handleOpenChange(false)}><X className="size-5" /></Button>
      </div>
      {notification && (
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-(--secondary-text)">
            <CalendarDays className="size-4 shrink-0" />
            <span className="min-w-0 break-words">{notification.created_at}</span>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5"
            onClickCapture={(event) => {
              const action = (event.target as Element).closest("a[href], button");
              if (action && event.currentTarget.contains(action) && display.message) {
                recordMessageInteraction(display.message, "clicked");
              }
            }}>
            <p className="whitespace-pre-wrap break-words text-sm leading-8 [overflow-wrap:anywhere]">{notification.body}</p>
          </div>
        </div>
      )}
      <div className="shrink-0 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button variant="outline" className="w-full" onClick={() => handleOpenChange(false)}>بستن</Button>
      </div>
    </>
  );

  return isMobile ? (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent dir="rtl" className="overflow-hidden data-[vaul-drawer-direction=bottom]:max-h-[88dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl">{content}</DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent dir="rtl" showCloseButton={false} className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">{content}</DialogContent>
    </Dialog>
  );
}

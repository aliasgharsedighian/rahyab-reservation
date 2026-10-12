"use client";

import { useState } from "react";
import { BellIcon, BellOff } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";
import NotificationDetails from "./NotificationDetails";
import type { NotificationItem } from "../types";

interface Props {
  notificationsData: NotificationItem[];
  revalidateData: () => Promise<void>;
}

export default function ClientNotificationsPage({ notificationsData, revalidateData }: Props) {
  const { markSeenNotification } = useNotifications();
  const [openNotif, setOpenNotif] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  const handleOpen = async (item: NotificationItem) => {
    setSelectedNotif(item);
    setOpenNotif(true);
    await markSeenNotification(item.id);
    await revalidateData();
  };

  return (
    <div dir="rtl" className="mx-2 min-w-0 space-y-6 md:mx-6">
      <div className="space-y-2 text-right">
        <h2 className="text-2xl font-bold">اعلان‌ها</h2>
        <p className="text-sm text-(--secondary-text)">لیست همه‌ی اعلان‌های شما</p>
      </div>
      {notificationsData.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-14 text-(--secondary-text)">
          <span className="flex size-14 items-center justify-center rounded-full bg-(--light-green) text-(--base-green)"><BellOff className="size-6" /></span>
          <p className="text-sm">پیامی ندارید</p>
        </div>
      ) : (
        <ul aria-label="فهرست اعلان‌ها" className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          {notificationsData.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => handleOpen(item)} className="group flex w-full items-start gap-3 px-3 py-4 text-right transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-(--base-green) sm:items-center sm:gap-4 sm:px-5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-(--light-green) text-(--base-green) sm:mt-0"><BellIcon className="size-4" /></span>
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="line-clamp-2 break-words text-sm leading-7 [overflow-wrap:anywhere]">{item.body}</span>
                  <span className="text-[11px] text-(--secondary-text) sm:text-xs">{item.created_at}</span>
                  <span className="sm:hidden"><NotificationStatus seen={item.seen} /></span>
                </span>
                <span className="hidden shrink-0 sm:block"><NotificationStatus seen={item.seen} /></span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <NotificationDetails notification={selectedNotif} open={openNotif} onOpenChange={setOpenNotif} />
    </div>
  );
}

function NotificationStatus({ seen }: { seen: boolean }) {
  return <span className={"inline-flex rounded-md px-2.5 py-1 text-[11px] " + (seen ? "bg-muted text-(--secondary-text)" : "bg-(--light-green) text-(--base-green)")}>{seen ? "خوانده شده" : "خوانده نشده"}</span>;
}

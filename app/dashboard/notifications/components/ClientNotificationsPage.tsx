"use client";

import { useRef, useState } from "react";
import { BellOff } from "lucide-react";
import DashboardEmptyState from "../../components/DashboardEmptyState";
import { useNotifications } from "../../context/NotificationContext";
import NotificationDetails from "./NotificationDetails";
import NotificationRow from "./NotificationRow";
import type { NotificationItem } from "../types";

export default function ClientNotificationsPage({ notificationsData }: { notificationsData: NotificationItem[] }) {
  const { markSeenNotification, seenIds } = useNotifications();
  const [openNotif, setOpenNotif] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);
  const selectedRow = useRef<HTMLElement | null>(null);

  const handleOpen = (item: NotificationItem) => {
    selectedRow.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSelectedNotif(item);
    setOpenNotif(true);
    if (!item.seen && !seenIds.has(item.id)) void markSeenNotification(item.id);
  };

  return (
    <>
      {notificationsData.length === 0 ? (
        <DashboardEmptyState
          icon={BellOff}
          title="هنوز اعلانی ندارید"
          description="وقتی دربارهٔ رزروها یا حساب کاربری‌تان پیامی دریافت کنید، جزئیات آن را اینجا می‌بینید."
        />
      ) : (
        <ul aria-label="فهرست اعلان‌ها" className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card text-card-foreground">
          {notificationsData.map((item) => (
            <li key={item.id}>
              <NotificationRow item={item} seen={item.seen || seenIds.has(item.id)} onOpen={() => handleOpen(item)} />
            </li>
          ))}
        </ul>
      )}
      <NotificationDetails
        notification={selectedNotif}
        open={openNotif}
        onOpenChange={setOpenNotif}
        onCloseAutoFocus={() => selectedRow.current?.focus()}
      />
    </>
  );
}

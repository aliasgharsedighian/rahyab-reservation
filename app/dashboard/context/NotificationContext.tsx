"use client";

import { apiClient } from "@/lib/api/client";
import { activateBaasPush } from "@/lib/baas-push";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { MarkNotificationSeenResponse, NotificationsResponse } from "../notifications/types";

async function fetchNotifications(query: string) {
  const { data: result, status } = await apiClient.get<NotificationsResponse>(
    `notifications?${query}`, { timeout: 15000 },
  );
  if (status !== 200 || result.status !== 200) throw new Error("Notifications refresh failed");
  return result.data;
}

type Preview = {
  items: NotificationsResponse["data"]["notifications"];
  state: "loading" | "ready" | "error";
};

type NotificationContextType = {
  preview: Preview;
  unreadCount: number;
  seenIds: ReadonlySet<number>;
  getNotifications: (reportError?: boolean) => Promise<void>;
  markSeenNotification: (notificationId: number) => Promise<boolean>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<Preview>({ items: [], state: "loading" });
  const [unreadCount, setUnreadCount] = useState(0);
  const [seenIds, setSeenIds] = useState<ReadonlySet<number>>(new Set());
  const requestId = useRef(0);
  const pendingMarks = useRef(new Map<number, Promise<boolean>>());
  useEffect(activateBaasPush, []);

  const getNotifications = useCallback(async (reportError = false) => {
    const id = ++requestId.current;
    setPreview((current) => ({ ...current, state: "loading" }));
    const [recent, unread] = await Promise.allSettled([
      fetchNotifications("count=10&page=1"),
      fetchNotifications("count=1&page=1&seen=false"),
    ]);

    if (id === requestId.current) {
      if (recent.status === "fulfilled") {
        setPreview({ items: recent.value.notifications, state: "ready" });
      } else {
        setPreview((current) => ({ ...current, state: "error" }));
      }
      if (unread.status === "fulfilled") setUnreadCount(unread.value.pagination.total);
    }
    if (reportError && (recent.status === "rejected" || unread.status === "rejected")) {
      throw new Error("Notifications refresh failed");
    }
  }, []);

  const markSeenNotification = (notificationId: number) => {
    const pending = pendingMarks.current.get(notificationId);
    if (pending) return pending;

    const mark = apiClient.post<MarkNotificationSeenResponse>("notifications/mark-seen", {
      notification_id: notificationId,
    }, { timeout: 15000 }).then(({ data }) => {
      if (data.status !== 200) throw new Error("Notification mark-seen failed");
      setSeenIds((ids) => new Set(ids).add(notificationId));
      void getNotifications();
      return true;
    }).catch(() => {
      toast.error("وضعیت خوانده‌شدن ثبت نشد. دوباره تلاش کنید.");
      return false;
    }).finally(() => pendingMarks.current.delete(notificationId));

    pendingMarks.current.set(notificationId, mark);
    return mark;
  };

  useEffect(() => {
    // Defer fetching until after hydration and let Strict Mode cancel its initial pass.
    const timer = window.setTimeout(() => void getNotifications(), 0);
    return () => window.clearTimeout(timer);
  }, [getNotifications]);

  return (
    <NotificationContext.Provider value={{ preview, unreadCount, seenIds, getNotifications, markSeenNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}

"use client";

import { apiClient } from "@/lib/api/client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import type { NotificationItem, NotificationsResponse, MarkNotificationSeenResponse } from "../notifications/types";

type NotificationContextType = {
  notificationsData: NotificationItem[];
  getNotifications: (reportError?: boolean) => Promise<void>;
  markSeenNotification: (notificationId: number) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notificationsData, setNotificationsData] = useState<NotificationItem[]>([]);

  const getNotifications = useCallback(async (reportError = false) => {
    try {
      const { data: result, status } = await apiClient.get<NotificationsResponse>(
        "notifications?count=10&page=1&seen=false",
        { timeout: 15000 },
      );

      if (status === 200 && result.status === 200) {
        setNotificationsData(result.data.notifications);
      } else if (reportError) {
        throw new Error("Notifications refresh failed");
      }
    } catch (error) {
      console.error(error);
      if (reportError) throw error;
    }
  }, []);

  const markSeenNotification = async (notificationId: number) => {
    try {
      const { data: result } = await apiClient.post<MarkNotificationSeenResponse>(
        "notifications/mark-seen",
        {
          notification_id: notificationId,
        },
      );

      if (result.status === 200) {
        await getNotifications();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // The state update happens after the awaited API request, never synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void getNotifications();
  }, [getNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notificationsData,
        getNotifications,
        markSeenNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }

  return context;
};

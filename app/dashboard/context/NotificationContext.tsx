"use client";

import { apiClient } from "@/lib/api/client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type NotificationContextType = {
  notificationsData: any[];
  getNotifications: () => Promise<void>;
  markSeenNotification: (notificationId: number) => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notificationsData, setNotificationsData] = useState<any[]>([]);

  const getNotifications = async () => {
    try {
      const { data: result, status } = await apiClient.get(
        "notifications?count=10&page=1&seen=false",
      );

      if (status === 200 && result.status === 200) {
        setNotificationsData(result.data.notifications);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markSeenNotification = async (notificationId: number) => {
    try {
      const { data: result } = await apiClient.post(
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
    getNotifications();
  }, []);

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

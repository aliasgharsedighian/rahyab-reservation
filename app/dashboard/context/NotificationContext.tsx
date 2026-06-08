"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import logoutCookiesAction from "@/actions/logoutCookiesAction";

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
      const token = localStorage.getItem("token");

      const myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}notifications?count=10&page=1&seen=false`,
        {
          method: "GET",
          headers: myHeaders,
        },
      );

      const result = await response.json();

      if (result.status === 200) {
        setNotificationsData(result.data.notifications);
      } else {
        localStorage.removeItem("token");
        logoutCookiesAction();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markSeenNotification = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");

      const myHeaders = new Headers();
      myHeaders.append("accept", "*/*");
      myHeaders.append("Authorization", `Bearer ${token}`);
      myHeaders.append("Content-Type", "application/json");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}notifications/mark-seen`,
        {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({
            notification_id: notificationId,
          }),
        },
      );

      const result = await response.json();

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

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BellIcon } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

function ClientNotificationsPage({ notificationsData, revalidateData }: any) {
  const { markSeenNotification } = useNotifications();
  const [openNotif, setOpenNotif] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<any>(null);

  const handleOpen = (item: any) => {
    setSelectedNotif(item);
    setOpenNotif(true);
  };

  useEffect(() => {
    const updateNotification = async () => {
      if (openNotif && selectedNotif) {
        await markSeenNotification(selectedNotif.id);
        await revalidateData();
      }
    };

    updateNotification();
  }, [openNotif, selectedNotif]);

  return (
    <div className="flex flex-col gap-4 mx-2 md:mx-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3">
        <h2 className="text-2xl font-bold">اعلان‌ها</h2>
        <p className="text-(--secondary-text)">لیست همه‌ی اعلان های شما</p>
      </div>

      {/* List */}
      {notificationsData.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-gray-500 border rounded-xl">
          پیامی ندارید
        </div>
      ) : (
        <div className="max-w-lg bg-white shadow-sm flex flex-col border rounded-xl overflow-hidden divide-y">
          {notificationsData.map((item: any) => (
            <div
              key={item.id}
              onClick={() => handleOpen(item)}
              className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition"
            >
              {/* Content */}
              <div className="flex flex-col flex-1">
                <p className="text-sm text-(--base-black) line-clamp-1">
                  {item.body}
                </p>

                <span className="text-xs text-gray-400 mt-1">
                  {item.created_at}
                </span>
              </div>

              {/* unread dot */}
              {!item.seen ? (
                <span className="p-2 text-[11px] bg-(--light-green) text-(--base-green) rounded-md">
                  خوانده نشده
                </span>
              ) : (
                <BellIcon className="text-(--base-green)" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={openNotif} onOpenChange={setOpenNotif}>
        <DialogContent className="rtl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center iranSansBold text-xl">
              جزئیات اعلان
            </DialogTitle>
          </DialogHeader>

          {selectedNotif && (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-(--base-black)">
                {selectedNotif.body}
              </p>

              <div className="flex justify-between text-xs text-gray-400">
                <span>{selectedNotif.created_at}</span>

                {/* {!selectedNotif.seen && (
                  <span className="text-(--base-green)">خوانده نشده</span>
                )} */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientNotificationsPage;

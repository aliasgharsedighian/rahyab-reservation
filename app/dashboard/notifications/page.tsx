import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/api/server";
import AnalyticsErrorEvents from "@/app/components/AnalyticsErrorEvents";
import ApiLoadFailure from "@/app/components/ApiLoadFailure";
import type { ErrorOccurrence } from "@/lib/analytics-errors";
import DashboardHeader from "../components/DashboardHeader";
import ClientNotificationsPage from "./components/ClientNotificationsPage";
import PushNotificationControl from "./components/PushNotificationControl";
import DashboardPagination from "../components/DashboardPagination";

import type { NotificationsResponse } from "./types";

interface Props {
  searchParams: Promise<{
    page?: string;
  }>;
}

const getNotifications = async (
  errorEvents: ErrorOccurrence[],
  per_page: string = "10",
  page: string = "1",
) => {
  const res = await serverApiFetch(
    `notifications?count=${per_page}&page=${page}`,
    {},
    errorEvents,
  );

  if (res.status === 200) {
    const notifications: NotificationsResponse = await res.json();
    return notifications.data;
  }
};

export default async function NotificationsPage({ searchParams }: Props) {
  const per_page = "6";
  const { page = "1" } = await searchParams;

  const errorEvents: ErrorOccurrence[] = [];
  const notifications = await getNotifications(errorEvents, per_page, page);

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/notifications`);
  }

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <AnalyticsErrorEvents events={errorEvents} />
      <DashboardHeader title={"اعلان ها"} />
      <PushNotificationControl />
      {!notifications && errorEvents.length > 0 ? <ApiLoadFailure /> : <ClientNotificationsPage
        notificationsData={notifications?.notifications ?? []}
        revalidateData={revalidateData}
      />}
      {Boolean(notifications?.notifications.length) && <div className="ml-auto">
        <div className="mr-4">
          <DashboardPagination
            per_page={per_page}
            page={page}
            posts={notifications?.pagination.total || per_page}
          />
        </div>
      </div>}
    </div>
  );
}

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

  return (
    <div className="mb-10 flex w-full flex-col gap-6">
      <AnalyticsErrorEvents events={errorEvents} />
      <DashboardHeader title="اعلان‌ها" />
      <div dir="rtl" className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-5 px-3 md:px-6">
        <PushNotificationControl />
        <section aria-labelledby="notification-list-title" className="space-y-3">
          <h1 id="notification-list-title" className="text-lg font-bold sm:text-xl">همهٔ اعلان‌ها</h1>
          {!notifications && errorEvents.length > 0 ? (
            <ApiLoadFailure />
          ) : (
            <ClientNotificationsPage notificationsData={notifications?.notifications ?? []} />
          )}
        </section>
        {notifications && notifications.pagination.total > Number(per_page) && (
          <div className="self-start">
            <DashboardPagination per_page={per_page} page={page} posts={notifications.pagination.total} />
          </div>
        )}
      </div>
    </div>
  );
}

import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/api/server";
import DashboardHeader from "../components/DashboardHeader";
import ClientNotificationsPage from "./components/ClientNotificationsPage";
import DashboardPagination from "../components/DashboardPagination";

interface Props {
  searchParams: Promise<{
    page: string;
  }>;
}

const getNotifications = async (
  per_page: string = "10",
  page: string = "1",
) => {
  const res = await serverApiFetch(
    `notifications?count=${per_page}&page=${page}`,
  );

  const notifications = await res.json();
  if (res.status === 200) {
    return notifications.data;
  }
};

export default async function NotificationsPage({ searchParams }: Props) {
  const per_page = "6";
  const { page } = await searchParams;

  const notifications = await getNotifications(per_page, page);

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/notifications`);
  }

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <DashboardHeader title={"اعلان ها"} />
      <ClientNotificationsPage
        notificationsData={notifications.notifications}
        revalidateData={revalidateData}
      />
      <div className="ml-auto">
        <div className="mr-4">
          <DashboardPagination
            per_page={per_page}
            page={page}
            posts={notifications?.pagination.total || per_page}
          />
        </div>
      </div>
    </div>
  );
}

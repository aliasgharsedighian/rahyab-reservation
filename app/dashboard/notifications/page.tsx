import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import DashboardHeader from "../components/DashboardHeader";
import ClientNotificationsPage from "./components/ClientNotificationsPage";

interface Props {
  searchParams: Promise<{
    page: string;
  }>;
}

const getNotifications = async (
  per_page: string = "10",
  page: string = "1",
) => {
  const cookieStore = await cookies();
  const browserId = cookieStore.get("user_token")?.value;
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", `Bearer ${browserId}`);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADDRESS}notifications?count=${per_page}&page=${page}`,
    requestOptions,
  );

  const notifications = await res.json();
  if (res.status === 200) {
    return notifications.data;
  }
};

export default async function NotificationsPage({ searchParams }: Props) {
  const per_page = "40";
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
    </div>
  );
}

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import DashboardPagination from "../components/DashboardPagination";
import ReserveHistoryTable from "./components/ReserveHistoryTable";
import DashboardHeader from "../components/DashboardHeader";

interface Props {
  searchParams: Promise<{
    page: string;
  }>;
}

const getReserveHistory = async (
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
    `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations/history?per_page=${per_page}&page=${page}`,
    requestOptions,
  );

  const reserveHistory = await res.json();
  if (res.status === 200) {
    return reserveHistory.data;
  }
};

export default async function HistoryReservePage({ searchParams }: Props) {
  const per_page = "10";
  const { page } = await searchParams;

  const reserveHistory = await getReserveHistory(per_page, page);

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/history-reserve`);
  }

  if (!reserveHistory.items) return;

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <DashboardHeader title={"رزروهای گذشته"} />
      <div className="w-full flex flex-col gap-3 ">
        {reserveHistory.items.length === 0 ? (
          <div className="w-full flex flex-col gap-3">
            <p>لیست رزروهای شما خالی است.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mx-2 md:mx-6">
            <ReserveHistoryTable reserveHistory={reserveHistory?.items} />
            <DashboardPagination
              per_page={per_page}
              page={page}
              posts={reserveHistory?.pagination.total || per_page}
            />
          </div>
        )}
      </div>
    </div>
  );
}

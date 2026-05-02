import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import DashboardPagination from "../components/DashboardPagination";
import ReserveUpcomingTable from "./components/ReserveUpcomingTable";

interface Props {
  searchParams: Promise<{
    page: string;
  }>;
}

const getReserveUpcoming = async (
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
    `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations/upcoming?per_page=${per_page}&page=${page}`,
    requestOptions,
  );

  const reserveUpcoming = await res.json();
  if (res.status === 200) {
    return reserveUpcoming.data;
  }
};

export default async function UpcomingReservePage({ searchParams }: Props) {
  const per_page = "10";
  const { page } = await searchParams;

  const reserveUpcoming = await getReserveUpcoming(per_page, page);

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/history-reserve`);
  }

  if (!reserveUpcoming.items) return;

  return (
    <div className="w-full flex flex-col gap-3">
      {reserveUpcoming.items.length === 0 ? (
        <div className="w-full flex flex-col gap-3">
          <p>لیست رزروهای شما خالی است.</p>
        </div>
      ) : (
        <>
          <ReserveUpcomingTable reserveUpcoming={reserveUpcoming?.items} />
          <DashboardPagination
            per_page={per_page}
            page={page}
            posts={reserveUpcoming?.pagination.total || per_page}
          />
        </>
      )}
    </div>
  );
}

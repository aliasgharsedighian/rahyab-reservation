import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import DashboardPagination from "../components/DashboardPagination";
import ReserveUpcomingTable from "./components/ReserveUpcomingTable";
import DashboardHeader from "../components/DashboardHeader";

interface Props {
  searchParams: Promise<{
    page: string;
    food_name: string;
    reserve_date_from_jalali: string;
    reserve_date_to_jalali: string;
    status: string;
  }>;
}

const getReserveUpcoming = async (
  per_page: string = "10",
  page: string = "1",
  food_name: string,
  reserve_date_from_jalali: string,
  reserve_date_to_jalali: string,
  status: string,
) => {
  const params = new URLSearchParams();
  params.set("count", String(per_page));
  params.set("page", String(page));
  if (food_name) {
    params.set("food_name", food_name);
  }

  if (reserve_date_from_jalali) {
    params.set("reserve_date_from_jalali", reserve_date_from_jalali);
  }

  if (reserve_date_to_jalali) {
    params.set("reserve_date_to_jalali", reserve_date_to_jalali);
  }

  if (status) {
    params.set("status", status);
  }
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
    `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations/upcoming?${params.toString()}`,
    requestOptions,
  );

  const reserveUpcoming = await res.json();
  if (res.status === 200) {
    return reserveUpcoming.data;
  }
};

export default async function UpcomingReservePage({ searchParams }: Props) {
  const per_page = "6";
  const {
    page,
    food_name,
    reserve_date_from_jalali,
    reserve_date_to_jalali,
    status,
  } = await searchParams;

  const reserveUpcoming = await getReserveUpcoming(
    per_page,
    page,
    food_name,
    reserve_date_from_jalali,
    reserve_date_to_jalali,
    status,
  );

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/upcoming-reserve`);
  }

  if (!reserveUpcoming.items) return;

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <DashboardHeader title={"رزروهای پیش رو"} />
      <div className="w-full flex flex-col gap-3">
        <div className="flex flex-col gap-4 mx-2 md:mx-6">
          <div className="mb-6 flex flex-col gap-3">
            <h2 className="text-2xl font-bold">رزرو‌های پیش رو</h2>
            <p className="text-(--secondary-text)">
              لیست غذاهای رزرو شده پیش روی شما
            </p>
          </div>
          <ReserveUpcomingTable
            reserveUpcoming={reserveUpcoming?.items}
            revalidateData={revalidateData}
          />
          <DashboardPagination
            per_page={per_page}
            page={page}
            posts={reserveUpcoming?.pagination.total || per_page}
          />
        </div>
      </div>
    </div>
  );
}

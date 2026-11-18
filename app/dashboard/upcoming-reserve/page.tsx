import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/api/server";
import AnalyticsErrorEvents from "@/app/components/AnalyticsErrorEvents";
import ApiLoadFailure from "@/app/components/ApiLoadFailure";
import type { ErrorOccurrence } from "@/lib/analytics-errors";
import DashboardPagination from "../components/DashboardPagination";
import ClearPaidReservationCart from "./components/ClearPaidReservationCart";
import ReserveUpcomingTable from "./components/ReserveUpcomingTable";
import DashboardHeader from "../components/DashboardHeader";
import type { ReservationUpcomingResponse } from "./types";

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
  errorEvents: ErrorOccurrence[],
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
  const res = await serverApiFetch(
    `reservations/upcoming?${params.toString()}`,
    {},
    errorEvents,
  );
  if (res.status === 200) {
    const reserveUpcoming: ReservationUpcomingResponse = await res.json();
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

  const errorEvents: ErrorOccurrence[] = [];
  const reserveUpcoming = await getReserveUpcoming(
    errorEvents,
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

  if (!reserveUpcoming?.items) {
    return (
      <>
        <AnalyticsErrorEvents events={errorEvents} />
        {errorEvents.length > 0 && <ApiLoadFailure />}
        <ClearPaidReservationCart />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <AnalyticsErrorEvents events={errorEvents} />
      <ClearPaidReservationCart />
      <DashboardHeader title={"رزروهای پیش رو"} />
      <div className="w-full flex flex-col gap-3">
        <div className="flex flex-col gap-4 mx-2 md:mx-6">
          <div className="mb-2 flex flex-col gap-2">
            <h2 className="text-2xl font-bold sm:text-3xl">رزرو‌های پیش رو</h2>
            <p className="text-(--secondary-text)">
              لیست غذاهای رزرو شده پیش روی شما
            </p>
          </div>
          <ReserveUpcomingTable
            reserveUpcoming={reserveUpcoming?.items}
            revalidateData={revalidateData}
          />
          {reserveUpcoming.items.length > 0 && <DashboardPagination
            per_page={per_page}
            page={page}
            posts={reserveUpcoming?.pagination.total || per_page}
          />}
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import ReservePageSkeleton from "./components/ReservePageSkeleton";
import ClientReservePage from "./components/ClientReservePage";
import DashboardHeader from "../components/DashboardHeader";
import { getWalletBalance } from "./getWalletBalance";
import type { UnreviewedReservation, WeeklyMenuResponse } from "./types";
import { serverApiFetch } from "@/lib/api/server";

interface ReservationHistoryResponse {
  data?: {
    items?: UnreviewedReservation[];
  };
}

const getUnreviewedReservations = async () => {
  const params = new URLSearchParams({ count: "1", page: "1" });
  const res = await serverApiFetch(
    `reservations/history?${params.toString()}`,
  );

  if (!res.ok) return [];

  const response = (await res.json()) as ReservationHistoryResponse;
  return (response.data?.items ?? []).filter(
    (item) => item.status !== "cancelled" && !item.has_feedback?.has_feedback,
  );
};

const getReserveList = async () => {
  const res = await serverApiFetch("weekly-menu");
  if (!res.ok) return null;

  const reserveList: WeeklyMenuResponse = await res.json();
  return reserveList.data ?? null;
};

async function ReserveMenuContent() {
  const [reserveList, walletBalance, unreviewedReservations] =
    await Promise.all([
      getReserveList(),
      getWalletBalance(),
      getUnreviewedReservations(),
    ]);

  return <ClientReservePage reserveList={reserveList} walletBalance={walletBalance}
    unreviewedReservations={unreviewedReservations} />;
}

export default function ReservePage() {
  return <div className="mb-56 flex w-full flex-col gap-6 md:mb-10">
    <DashboardHeader title="رزرو غذا" stickyHeightVariable="--reserve-header-height" />
    <Suspense fallback={<ReservePageSkeleton />}><ReserveMenuContent /></Suspense>
  </div>;
}

import ClientReservePage from "./components/ClientReservePage";
import DashboardHeader from "../components/DashboardHeader";
import { getWalletBalance } from "./getWalletBalance";
import type { UnreviewedReservation } from "./types";
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

  const reserveList = await res.json();
  return reserveList.data ?? null;
};

export default async function ReservePage() {
  const [reserveList, walletBalance, unreviewedReservations] =
    await Promise.all([
      getReserveList(),
      getWalletBalance(),
      getUnreviewedReservations(),
    ]);

  return (
    <div className="flex flex-col gap-6 w-full mb-40 md:mb-10">
      <DashboardHeader title={"رزرو غذا"} />
      <ClientReservePage
        reserveList={reserveList}
        walletBalance={walletBalance}
        unreviewedReservations={unreviewedReservations}
      />
    </div>
  );
}

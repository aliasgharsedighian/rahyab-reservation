import { cookies } from "next/headers";
import ClientReservePage from "./components/ClientReservePage";
import DashboardHeader from "../components/DashboardHeader";
import { getWalletBalance } from "./getWalletBalance";
import type { UnreviewedReservation } from "./types";

interface ReservationHistoryResponse {
  data?: {
    items?: UnreviewedReservation[];
  };
}

const getUnreviewedReservations = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;

  if (!token) return [];

  try {
    const params = new URLSearchParams({ count: "1", page: "1" });
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations/history?${params.toString()}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) return [];

    const response = (await res.json()) as ReservationHistoryResponse;
    return (response.data?.items ?? []).filter(
      (item) =>
        item.status !== "cancelled" && !item.has_feedback?.has_feedback,
    );
  } catch (error) {
    console.error("Failed to fetch unreviewed reservations:", error);
    return [];
  }
};

const getReserveList = async () => {
  const cookieStore = await cookies();
  const browserId = cookieStore.get("user_token")?.value;
  const headers = new Headers();
  headers.append("Accept", "application/json");
  headers.append("Authorization", `Bearer ${browserId}`);
  const requestOptions = {
    method: "GET",
    headers,
  };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADDRESS}weekly-menu`,
    requestOptions,
  );

  const reserveList = await res.json();
  if (res.status === 200) {
    return reserveList.data;
  }
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

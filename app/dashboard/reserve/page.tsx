import ClientReservePage from "./components/ClientReservePage";
import { getWalletBalance } from "./getWalletBalance";
import type { UnreviewedReservation, WeeklyMenuResponse } from "./types";
import { serverApiFetch } from "@/lib/api/server";
import AnalyticsErrorEvents from "@/app/components/AnalyticsErrorEvents";
import { collectErrorOccurrence, type ErrorOccurrence } from "@/lib/analytics-errors";

interface ReservationHistoryResponse {
  data?: {
    items?: UnreviewedReservation[];
  };
}

const getUnreviewedReservations = async (errorEvents: ErrorOccurrence[]) => {
  const params = new URLSearchParams({ count: "1", page: "1" });
  const res = await serverApiFetch(
    `reservations/history?${params.toString()}`,
    {},
    errorEvents,
  );

  if (!res.ok) return [];

  const response = (await res.json()) as ReservationHistoryResponse;
  return (response.data?.items ?? []).filter(
    (item) => item.status !== "cancelled" && !item.has_feedback?.has_feedback,
  );
};

const menuError = { eventName: "menu_load_failed", operation: "load_menu" } as const;

const getReserveList = async (errorEvents: ErrorOccurrence[]) => {
  const res = await serverApiFetch("weekly-menu", {}, errorEvents, menuError);
  if (res.status === 204) return { menu: null, failed: false };
  if (!res.ok) {
    if (!errorEvents.some(({ eventName }) => eventName === menuError.eventName)) {
      collectErrorOccurrence(errorEvents, menuError, `http_${res.status}`);
    }
    return { menu: null, failed: true };
  }

  const payload: WeeklyMenuResponse | null | undefined = await res.json().catch(() => undefined);
  if (payload === null) return { menu: null, failed: false };
  if (!payload || typeof payload !== "object" || payload.success === false
    || (typeof payload.status === "number" && payload.status >= 400)
    || (payload.data != null && !Array.isArray(payload.data.weeks))) {
    collectErrorOccurrence(errorEvents, menuError, "invalid_response");
    return { menu: null, failed: true };
  }
  return { menu: payload.data ?? null, failed: false };
};

export default async function ReservePage() {
  const errorEvents: ErrorOccurrence[] = [];
  const [{ menu, failed }, walletBalance, unreviewedReservations] =
    await Promise.all([
      getReserveList(errorEvents),
      getWalletBalance(errorEvents),
      getUnreviewedReservations(errorEvents),
    ]);

  return (
    <>
      <AnalyticsErrorEvents events={errorEvents} />
      <ClientReservePage reserveList={menu} walletBalance={walletBalance}
        menuLoadFailed={failed} unreviewedReservations={unreviewedReservations} />
    </>
  );
}

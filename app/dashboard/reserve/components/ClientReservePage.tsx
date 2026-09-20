"use client";

import { apiClient } from "@/lib/api/client";

import FoodReserveTabs, { type FoodReserveList } from "./FoodReserveTabs";
import FoodReserveCart from "./FoodReserveCart";
import useDetectMobile from "@/app/components/hooks/DetectMobile";
import FoodReserveCardMobile from "./FoodReserveCardMobile";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeAllItemsFromReserve,
  reserveSelectItems,
  updateReserveCart,
} from "@/redux/features/reserveBasketSlice";
import { toast } from "sonner";
import type { ReserveCartItem, UnreviewedReservation } from "../types";
import { useRouter } from "next/navigation";
import {
  OPEN_WALLET_CHARGE_GUIDE_EVENT,
  type WalletChargeGuideCartDetail,
} from "../../components/WalletChargeGuideModal";
import ReservationFeedbackPrompt from "./ReservationFeedbackPrompt";

interface ClientReservePageProps {
  reserveList: FoodReserveList | null;
  walletBalance: number | null;
  unreviewedReservations: UnreviewedReservation[];
}

interface ReservationResponse {
  status: number;
  message: string;
  data: {
    payment_url?: string;
  };
}

function ClientReservePage({
  reserveList,
  walletBalance,
  unreviewedReservations,
}: ClientReservePageProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const reserveCart = useSelector(reserveSelectItems) as ReserveCartItem[];
  const isMobile = useDetectMobile();

  const firstReservableDate = useMemo(() => {
    for (const week of reserveList?.weeks ?? []) {
      for (const day of week.days) {
        const timestamp = Date.parse(day.date);

        if (!Number.isNaN(timestamp)) return timestamp;
      }
    }

    return null;
  }, [reserveList]);

  const activeReserveCart = useMemo(() => {
    if (firstReservableDate === null) return reserveCart;

    return reserveCart.filter((item) => {
      const itemDate = Date.parse(item.date);

      // Keep legacy/malformed items rather than deleting user data unexpectedly.
      return Number.isNaN(itemDate) || itemDate >= firstReservableDate;
    });
  }, [firstReservableDate, reserveCart]);

  useEffect(() => {
    if (activeReserveCart.length !== reserveCart.length) {
      dispatch(updateReserveCart(activeReserveCart));
    }
  }, [activeReserveCart, dispatch, reserveCart.length]);

  const totalPrice = useMemo(
    () =>
      activeReserveCart.reduce(
        (total, item) => total + item.price * item.count,
        0,
      ),
    [activeReserveCart],
  );
  const totalCount = useMemo(
    () =>
      activeReserveCart.reduce((total, item) => total + item.count, 0),
    [activeReserveCart],
  );
  const sortedReserveCart = useMemo(() => {
    return [...activeReserveCart].sort((a, b) =>
      a.jalali_date.localeCompare(b.jalali_date),
    );
  }, [activeReserveCart]);

  const sendDataToApi = async () => {
    const items = activeReserveCart.map((item) => ({
      weekly_menu_id: item.id,
      quantity: item.count,
    }));

    try {
      const { data: responseData } = await apiClient.post<ReservationResponse>(
        "reservations",
        {
          items,
        },
      );
      if (responseData.status !== 201) {
        toast.error("موجودی کیف پول کافی نیست.");
        const detail: WalletChargeGuideCartDetail | null =
          walletBalance === null
            ? null
            : {
                source: "cart",
                totalPrice: Number(totalPrice),
                walletBalance,
              };
        window.dispatchEvent(
          detail
            ? new CustomEvent(OPEN_WALLET_CHARGE_GUIDE_EVENT, { detail })
            : new Event(OPEN_WALLET_CHARGE_GUIDE_EVENT),
        );
        return;
      }

      // if (responseData.data.payment_url) {
      //   return;
      // }

      if (responseData.status === 201) {
        toast.success("پرداخت با موفقیت از کیف پول شما انجام شد");
        dispatch(removeAllItemsFromReserve([]));
        router.refresh();
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="flex gap-6 w-full">
      <ReservationFeedbackPrompt reservations={unreviewedReservations} />
      <div className="w-full md:basis-8/12 mx-2 md:mr-6">
        <FoodReserveTabs reserveList={reserveList} />
      </div>
      {isMobile ? (
        <FoodReserveCardMobile
          reserveCart={activeReserveCart}
          sortedReserveCart={sortedReserveCart}
          totalPrice={totalPrice}
          totalCount={totalCount}
          sendDataToApi={sendDataToApi}
          walletBalance={walletBalance}
        />
      ) : (
        <div className="basis-4/12 w-full ml-6 border-r">
          <FoodReserveCart
            reserveCart={activeReserveCart}
            sortedReserveCart={sortedReserveCart}
            totalPrice={totalPrice}
            totalCount={totalCount}
            sendDataToApi={sendDataToApi}
            walletBalance={walletBalance}
          />
        </div>
      )}
    </div>
  );
}

export default ClientReservePage;

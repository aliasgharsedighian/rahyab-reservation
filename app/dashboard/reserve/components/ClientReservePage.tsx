"use client";

import { apiClient } from "@/lib/api/client";

import FoodReserveTabs, { type FoodReserveList } from "./FoodReserveTabs";
import FoodReserveCart from "./FoodReserveCart";
import useDetectMobile from "@/app/components/hooks/DetectMobile";
import FoodReserveCardMobile from "./FoodReserveCardMobile";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeAllItemsFromReserve,
  reserveSelectItems,
  updateReserveCart,
} from "@/redux/features/reserveBasketSlice";
import { toast } from "sonner";
import type { UnreviewedReservation } from "../types";
import { useRouter } from "next/navigation";
import {
  OPEN_WALLET_CHARGE_GUIDE_EVENT,
  type WalletChargeGuideCartDetail,
} from "../../components/WalletChargeGuideModal";
import ReservationSuccessModal from "./ReservationSuccessModal";
import { isConfirmedReservation, removeOrphanedSides } from "../cartRules";
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
  const [reservationSucceeded, setReservationSucceeded] = useState(false);

  const reserveCart = useSelector(reserveSelectItems);
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
    // Restore metadata for baskets persisted before type/date reservation fields existed.
    const menuItems = new Map((reserveList?.weeks ?? []).flatMap((week) =>
      week.days.flatMap((day) => day.foods.flatMap((group) => group.items.map((food) =>
        [String(food.weekly_menu_id), { type: group.type, type_fa: group.type_fa,
          reserved_food_day: isConfirmedReservation(day.reserved_food_day) }] as const,
      ))),
    ));
    const currentItems = reserveCart.map((item) => {
      const metadata = menuItems.get(String(item.id));
      return metadata ? { ...item, ...metadata } : item;
    }).filter((item) => {
      if (firstReservableDate === null) return true;
      const itemDate = Date.parse(item.date);
      return Number.isNaN(itemDate) || itemDate >= firstReservableDate;
    });
    return removeOrphanedSides(currentItems);
  }, [firstReservableDate, reserveCart, reserveList]);

  useEffect(() => {
    if (JSON.stringify(activeReserveCart) !== JSON.stringify(reserveCart)) {
      dispatch(updateReserveCart(activeReserveCart));
    }
  }, [activeReserveCart, dispatch, reserveCart]);

  const totalPrice = useMemo(
    () =>
      activeReserveCart.reduce(
        (total, item) => total + item.price * item.count,
        0,
      ),
    [activeReserveCart],
  );
  const totalCount = useMemo(
    () => activeReserveCart.reduce((total, item) => total + item.count, 0),
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
        setReservationSucceeded(true);
        router.refresh();
      }
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="flex w-full items-start gap-5 px-2 md:px-5 xl:gap-8">
      <ReservationSuccessModal open={reservationSucceeded} onOpenChange={setReservationSucceeded} />
      <ReservationFeedbackPrompt reservations={unreviewedReservations} />
      <div className="min-w-0 flex-1">
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
        <div className="sticky top-25 w-[32%] min-w-64 max-w-sm shrink-0 self-start">
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

"use client";

import { apiClient } from "@/lib/api/client";

import FoodReserveTabs, { type FoodReserveList } from "./FoodReserveTabs";
import FoodReserveCart from "./FoodReserveCart";
import { useIsMobile } from "@/hooks/use-mobile";
import FoodReserveCardMobile from "./FoodReserveCardMobile";
import { useEffect, useMemo, useState } from "react";
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
import ReservationSuccessModal from "./ReservationSuccessModal";
import { hasReservedMainFoodForDay, removeOrphanedSides } from "../cartRules";
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
  const isMobile = useIsMobile();

  const firstReservableDate = useMemo(() => {
    for (const week of reserveList?.weeks ?? []) {
      for (const day of week.days) {
        const timestamp = Date.parse(day.date);

        if (!Number.isNaN(timestamp)) return timestamp;
      }
    }

    return null;
  }, [reserveList]);

  // Build the menu index once per API response, rather than on every quantity click.
  const menuItems = useMemo(() => {
    const entries = new Map<string, Pick<ReserveCartItem, "type" | "type_fa" | "reserved_food_day">>();
    for (const week of reserveList?.weeks ?? []) {
      for (const day of week.days) {
        const reservedMain = hasReservedMainFoodForDay(day);
        for (const group of day.foods) {
          for (const food of group.items) {
            entries.set(String(food.weekly_menu_id), {
              type: group.type, type_fa: group.type_fa, reserved_food_day: reservedMain,
            });
          }
        }
      }
    }
    return entries;
  }, [reserveList]);

  const activeReserveCart = useMemo(() => {
    const currentItems = reserveCart.map((item) => {
      const metadata = menuItems.get(String(item.id));
      if (!metadata || (item.type === metadata.type && item.type_fa === metadata.type_fa &&
        item.reserved_food_day === metadata.reserved_food_day)) return item;
      return { ...item, ...metadata };
    }).filter((item) => {
      if (firstReservableDate === null) return true;
      const itemDate = Date.parse(item.date);
      return Number.isNaN(itemDate) || itemDate >= firstReservableDate;
    });
    const items = removeOrphanedSides(currentItems);
    return items.length === reserveCart.length && items.every((item, index) => item === reserveCart[index])
      ? reserveCart : items;
  }, [firstReservableDate, reserveCart, menuItems]);

  useEffect(() => {
    if (activeReserveCart !== reserveCart) dispatch(updateReserveCart(activeReserveCart));
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

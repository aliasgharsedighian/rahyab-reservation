"use client";

import FoodReserveTabs, { type FoodReserveList } from "./FoodReserveTabs";
import FoodReserveCart from "./FoodReserveCart";
import useDetectMobile from "@/app/components/hooks/DetectMobile";
import FoodReserveCardMobile from "./FoodReserveCardMobile";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeAllItemsFromReserve,
  reserveSelectItems,
  reserveSelectTotalPrice,
  reserveTotalFoodCount,
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
  const totalPrice = useSelector(reserveSelectTotalPrice);
  const totalCount = useSelector(reserveTotalFoodCount);

  const isMobile = useDetectMobile();
  const sortedReserveCart = useMemo(() => {
    return [...reserveCart].sort((a, b) =>
      a.jalali_date.localeCompare(b.jalali_date),
    );
  }, [reserveCart]);

  const sendDataToApi = async () => {
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const items = reserveCart.map((item) => ({
      weekly_menu_id: item.id,
      quantity: item.count,
    }));

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            items,
          }),
        },
      );

      const responseData: ReservationResponse = await response.json();
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
          reserveCart={reserveCart}
          sortedReserveCart={sortedReserveCart}
          totalPrice={totalPrice}
          totalCount={totalCount}
          sendDataToApi={sendDataToApi}
          walletBalance={walletBalance}
        />
      ) : (
        <div className="basis-4/12 w-full ml-6 border-r">
          <FoodReserveCart
            reserveCart={reserveCart}
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

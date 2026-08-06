"use client";

import FoodReserveTabs from "./FoodReserveTabs";
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
import type { ReserveCartItem } from "../types";

interface ClientReservePageProps {
  reserveList: unknown;
  walletBalance: number | null;
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
}: ClientReservePageProps) {
  const dispatch = useDispatch();

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
      // console.log("Success:", responseData);
      if (responseData.status === 201) {
        if (responseData.data.payment_url) {
          const urlObject = new URL(responseData.data.payment_url);
          const params = new URLSearchParams(urlObject.search);
          const transactionId = params.get("payment_transaction_id");
          toast.success("پرداخت با موفقیت انجام شد");
          callbackApi("success", transactionId);
        } else {
          toast.success("پرداخت با موفقیت انجام شد");
          dispatch(removeAllItemsFromReserve([]));
          // refresh();
          // revalidateData();
          window.location.reload();
        }
      } else {
        toast.error(responseData.message);
      }

      // You can do something with the response data here, like updating state
    } catch (error) {
      console.error("Error sending data:", error);
      // Handle errors, like showing a message to the user
    }
  };

  const callbackApi = async (
    status: string,
    transactionId: string | null,
  ) => {
    const token = localStorage.getItem("token");
    const headers = new Headers();
    headers.append("Accept", "*/*");
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations/payment/callback`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            payment_transaction_id: transactionId,
            status: status,
            gateway_tracking_code: "GW-ABC123",
          }),
        },
      );

      dispatch(removeAllItemsFromReserve([]));
      // refresh();
      // revalidateData();
      window.location.reload();

      // You can do something with the response data here, like updating state
    } catch (error) {
      console.error("Error sending data:", error);
      // Handle errors, like showing a message to the user
    }
  };

  return (
    <div className="flex gap-6 w-full">
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

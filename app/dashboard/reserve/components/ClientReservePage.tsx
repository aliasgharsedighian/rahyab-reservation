"use client";

import FoodReserveTabs from "./FoodReserveTabs";
import FoodReserveCart from "./FoodReserveCart";
import useDetectMobile from "@/app/components/hooks/DetectMobile";
import FoodReserveCardMobile from "./FoodReserveCardMobile";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeAllItemsFromReserve,
  reserveSelectItems,
  reserveSelectTotalPrice,
} from "@/redux/features/reserveBasketSlice";
import { toast } from "sonner";

function ClientReservePage({ reserveList, revalidateData, refreshPage }: any) {
  const dispatch = useDispatch();

  const reserveCart = useSelector(reserveSelectItems);
  const totalPrice = useSelector(reserveSelectTotalPrice);

  const isMobile = useDetectMobile();
  const [sortedReserveCart, setSortedReserveCart] = useState<any>([]);

  useEffect(() => {
    const sortedReserveCart = [...reserveCart].sort((a, b) => {
      // Assuming item.jalali_date is in 'YYYY-MM-DD' format or similar
      // If it's a different format, you might need to parse it into Date objects
      // or a comparable numerical representation.
      return a.jalali_date.localeCompare(b.jalali_date);
    });

    setSortedReserveCart(sortedReserveCart);
  }, [reserveCart]);

  const sendDataToApi = async () => {
    const token = localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    let items: any = [];

    for (let i = 0; i < reserveCart.length; i++) {
      items = [
        ...items,
        {
          weekly_menu_id: reserveCart[i].id,
          quantity: reserveCart[i].count,
        },
      ];
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations`,
        {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({
            items,
          }),
        },
      );

      const responseData = await response.json();
      // console.log("Success:", responseData);
      if (responseData.data.payment_url) {
        const urlObject = new URL(responseData.data.payment_url);
        const params = new URLSearchParams(urlObject.search);
        const transactionId = params.get("payment_transaction_id");
        toast.success("پرداخت با موفقیت انجام شد");
        callbackApi("success", transactionId);
      }
      // You can do something with the response data here, like updating state
    } catch (error) {
      console.error("Error sending data:", error);
      // Handle errors, like showing a message to the user
    }
  };

  const callbackApi = async (status: string, transactionId: any) => {
    const token = localStorage.getItem("token");
    var myHeaders = new Headers();
    myHeaders.append("Accept", "*/*");
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations/payment/callback`,
        {
          method: "POST",
          headers: myHeaders,
          body: JSON.stringify({
            payment_transaction_id: transactionId,
            status: status,
            gateway_tracking_code: "GW-ABC123",
          }),
        },
      );

      const responseData = await response.json();
      console.log("Success:", responseData);
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
    <>
      <div className="w-full md:basis-8/12">
        <FoodReserveTabs reserveList={reserveList} />
      </div>
      {isMobile ? (
        <FoodReserveCardMobile
          reserveCart={reserveCart}
          sortedReserveCart={sortedReserveCart}
          totalPrice={totalPrice}
          sendDataToApi={sendDataToApi}
        />
      ) : (
        <div className="basis-4/12 w-full">
          <FoodReserveCart
            revalidateData={revalidateData}
            refresh={refreshPage}
            reserveCart={reserveCart}
            sortedReserveCart={sortedReserveCart}
            totalPrice={totalPrice}
            sendDataToApi={sendDataToApi}
          />
        </div>
      )}
    </>
  );
}

export default ClientReservePage;

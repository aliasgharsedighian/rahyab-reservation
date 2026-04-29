"use client";

import { Button } from "@/components/ui/button";
import {
  removeAllItemsFromReserve,
  reserveSelectItems,
  reserveSelectTotalPrice,
} from "@/redux/features/reserveBasketSlice";
import { ShoppingBasketIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

function FoodReserveCart({ revalidateData, refresh }: any) {
  const dispatch = useDispatch();

  const reserveCart = useSelector(reserveSelectItems);
  const totalPrice = useSelector(reserveSelectTotalPrice);

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
    <div className="flex flex-col w-full border rounded-md">
      <div className="bg-zinc-800 text-white p-2 rounded-t-md">
        <p>خلاصه رزرو هفته</p>
      </div>
      <div
        className={`min-h-48 flex flex-col ${reserveCart.length !== 0 ? "justify-start" : "justify-center"}`}
      >
        {reserveCart.length !== 0 ? (
          sortedReserveCart.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between">
              <p>
                {item.day} {item.jalali_date} {item.name}
              </p>
              <span>{item.count} عدد</span>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <ShoppingBasketIcon className="size-12 text-gray-500" />
            <p>سبد شما خالی است</p>
          </div>
        )}
      </div>
      <div className="min-h-16 border-t">
        <div className="flex items-center justify-between px-6 pt-3">
          <p className="iranSansBold">قیمت کل</p>
          <span className="flex items-center gap-7 iranSansBold text-sm md:text-base">
            {totalPrice.toLocaleString()}

            {"تومان"}
          </span>
        </div>
      </div>
      <Button onClick={sendDataToApi}>پرداخت</Button>
    </div>
  );
}

export default FoodReserveCart;

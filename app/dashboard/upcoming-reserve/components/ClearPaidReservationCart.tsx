"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { removeAllItemsFromReserve } from "@/redux/features/reserveBasketSlice";

export default function ClearPaidReservationCart() {
  const cart = useSearchParams().get("cart");
  const dispatch = useDispatch();

  useEffect(() => {
    if (cart !== "empty") return;

    const url = new URL(window.location.href);
    if (url.searchParams.get("cart") !== "empty") return;

    dispatch(removeAllItemsFromReserve([]));
    url.searchParams.delete("cart");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, [cart, dispatch]);

  return null;
}

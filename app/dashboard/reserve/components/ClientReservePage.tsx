"use client";

import { useSiteSettings } from "@/app/components/SiteSettingsProvider";
import { apiClient, UnauthorizedError } from "@/lib/api/client";

import FoodReserveTabs, { type FoodReserveList } from "./FoodReserveTabs";
import FoodReserveCart from "./FoodReserveCart";
import { useIsMobile } from "@/hooks/use-mobile";
import FoodReserveCardMobile from "./FoodReserveCardMobile";
import { useEffect, useMemo, useRef, useState } from "react";
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
}

interface OnlineReservationResponse extends ReservationResponse {
  success: boolean;
  data?: { payment_url?: string } | null;
}

function ClientReservePage({
  reserveList,
  walletBalance,
  unreviewedReservations,
}: ClientReservePageProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const settings = useSiteSettings();
  const onlinePayment = settings.find(({ key }) => key === "PAYMENT_TYPE")?.value === "online";
  const [isOnlineCheckoutPending, setIsOnlineCheckoutPending] = useState(false);
  const onlineCheckoutToast = useRef<string | number | null>(null);
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

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted || onlineCheckoutToast.current === null) return;

      toast.dismiss(onlineCheckoutToast.current);
      onlineCheckoutToast.current = null;
      setIsOnlineCheckoutPending(false);
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

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

  const completeReservation = (toastId?: string | number) => {
    toast.success("پرداخت با موفقیت از کیف پول شما انجام شد", { id: toastId });
    dispatch(removeAllItemsFromReserve([]));
    setReservationSucceeded(true);
    router.refresh();
  };

  const sendDataToApi = async () => {
    const items = activeReserveCart.map((item) => ({
      weekly_menu_id: item.id,
      quantity: item.count,
    }));

    if (onlinePayment) {
      if (onlineCheckoutToast.current !== null || items.length === 0) return;
      const toastId = toast.loading("در حال اتصال به درگاه پرداخت…");
      onlineCheckoutToast.current = toastId;
      setIsOnlineCheckoutPending(true);
      const paymentError = "ثبت رزرو یا اتصال به درگاه پرداخت ممکن نشد.";
      let isRedirecting = false;

      try {
        const { data, status } = await apiClient.post<OnlineReservationResponse>(
          "online-payments/order",
          { source: "web", items },
          { timeout: 15_000 },
        );

        if (status < 200 || status >= 300 || data?.success !== true) {
          toast.error(data?.message || paymentError, { id: toastId });
        } else if (data.status === 201) {
          completeReservation(toastId);
        } else if (data.status === 202) {
          const paymentUrl = new URL(data.data?.payment_url ?? "");
          if (paymentUrl.protocol !== "https:") throw new Error("Invalid payment URL");

          window.location.assign(paymentUrl.href);
          isRedirecting = true;
        } else {
          toast.error(paymentError, { id: toastId });
        }
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          toast.dismiss(toastId);
        } else {
          toast.error(paymentError, { id: toastId });
        }
      } finally {
        if (!isRedirecting) {
          onlineCheckoutToast.current = null;
          setIsOnlineCheckoutPending(false);
        }
      }
      return;
    }

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

      completeReservation();
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
          isOnlineCheckoutPending={isOnlineCheckoutPending}
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
            isOnlineCheckoutPending={isOnlineCheckoutPending}
            walletBalance={walletBalance}
          />
        </div>
      )}
    </div>
  );
}

export default ClientReservePage;

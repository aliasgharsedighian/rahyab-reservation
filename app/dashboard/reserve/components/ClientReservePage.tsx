"use client";

import { useSiteSettings } from "@/app/components/SiteSettingsProvider";
import ApiLoadFailure from "@/app/components/ApiLoadFailure";
import { apiClient, UnauthorizedError } from "@/lib/api/client";
import { logAnalyticsError } from "@/lib/analytics";
import { getTechnicalErrorCode } from "@/lib/analytics-errors";
import { getPaymentGatewayUrl } from "@/lib/payment-gateway";
import { confirmCartOrder, startOrderCheckout } from "@/lib/order-analytics";
import { beginCheckout, trackGatewayInitiated, trackWalletPaymentSucceeded, type PaymentAttempt } from "@/lib/payment-analytics";

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
  menuLoadFailed: boolean;
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
  menuLoadFailed,
  walletBalance,
  unreviewedReservations,
}: ClientReservePageProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const settings = useSiteSettings();
  const onlinePayment = settings.find(({ key }) => key === "PAYMENT_TYPE")?.value === "online";
  const [isOnlineCheckoutPending, setIsOnlineCheckoutPending] = useState(false);
  const onlineCheckoutToast = useRef<string | number | null>(null);
  const checkoutInProgress = useRef(false);
  const paymentAttempt = useRef<PaymentAttempt | undefined>(undefined);
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
      checkoutInProgress.current = false;
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

  const completeReservation = (response: unknown, toastId?: string | number) => {
    trackWalletPaymentSucceeded(response, paymentAttempt.current);
    confirmCartOrder(activeReserveCart, response);
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
    if (!items.length || checkoutInProgress.current) return;
    checkoutInProgress.current = true;
    const correlationId = startOrderCheckout(activeReserveCart);
    paymentAttempt.current = beginCheckout(correlationId, totalPrice, !onlinePayment);

    if (onlinePayment) {
      const toastId = toast.loading("در حال اتصال به درگاه پرداخت…");
      onlineCheckoutToast.current = toastId;
      setIsOnlineCheckoutPending(true);
      const paymentError = "ثبت رزرو یا اتصال به درگاه پرداخت ممکن نشد.";
      const errorAnalytics = { eventName: "payment_error", operation: "start_order_payment" } as const;
      let isRedirecting = false;

      try {
        const { data, status } = await apiClient.post<OnlineReservationResponse>(
          "online-payments/order",
          { source: "web", items },
          { timeout: 15_000, errorAnalytics },
        );

        if (getTechnicalErrorCode(status, data) || status < 200 || status >= 300 || data?.success !== true) {
          toast.error(data?.message || paymentError, { id: toastId });
        } else if (data.status === 201) {
          completeReservation(data, toastId);
        } else if (data.status === 202) {
          const paymentUrl = getPaymentGatewayUrl(data.data?.payment_url, errorAnalytics);
          trackGatewayInitiated(data, paymentAttempt.current, false);
          window.location.assign(paymentUrl);
          isRedirecting = true;
        } else {
          logAnalyticsError(errorAnalytics, "invalid_response");
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
          checkoutInProgress.current = false;
          setIsOnlineCheckoutPending(false);
        }
      }
      return;
    }

    const errorAnalytics = { eventName: "order_error", operation: "create_order" } as const;
    try {
      const { data: responseData, status } = await apiClient.post<ReservationResponse>(
        "reservations",
        {
          items,
        },
        { errorAnalytics },
      );
      if (getTechnicalErrorCode(status, responseData)) {
        toast.error("ثبت رزرو ممکن نشد. دوباره تلاش کنید.");
        return;
      }
      if (status >= 200 && status < 300 && typeof responseData?.status !== "number") {
        logAnalyticsError(errorAnalytics, "invalid_response");
        toast.error("ثبت رزرو ممکن نشد. دوباره تلاش کنید.");
        return;
      }
      if (status < 200 || status >= 300 || responseData?.status !== 201) {
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

      completeReservation(responseData);
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      console.error("Error sending data:", error);
      toast.error("ثبت رزرو ممکن نشد. دوباره تلاش کنید.");
    } finally {
      checkoutInProgress.current = false;
    }
  };

  return (
    <div className="flex w-full items-start gap-5 px-2 md:px-5 xl:gap-8">
      <ReservationSuccessModal open={reservationSucceeded} onOpenChange={setReservationSucceeded} />
      <ReservationFeedbackPrompt reservations={unreviewedReservations} />
      <div className="min-w-0 flex-1">
        {menuLoadFailed ? <ApiLoadFailure message="بارگذاری منو ممکن نشد." /> : <FoodReserveTabs reserveList={reserveList} />}
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

import type { UnreviewedReservation } from "../reserve/types";

export type ReservationStatus = "reserved" | "cancelled" | "payment_failed" | "__pending_gateway__";

// OpenAPI documents history query parameters and items/pagination, but not item schemas.
// Item fields follow the response already consumed by the history page.
export interface ReservationHistoryItem extends UnreviewedReservation {
  status: ReservationStatus;
  status_fa: string;
  reserve_date_jalali: string;
  reserve_day_name: string;
  quantity: number;
  unit_price: number;
  total_paid: number;
  image_url?: string | null;
}

export interface ReservationHistoryResponse {
  data?: {
    items: ReservationHistoryItem[];
    pagination: { total: number };
  };
}

export interface ReservationFeedbackResponse {
  status: number;
  message: string;
}

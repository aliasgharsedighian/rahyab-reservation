import type { ReservationStatus } from "../history-reserve/types";

// OpenAPI defines query fields/statuses, but omits the upcoming item response schema.
// Fields follow the actual reservation response; food_image_url can be absent or null.
export interface ReservationUpcomingItem {
  id: number;
  food_id: number;
  food_name: string;
  status: ReservationStatus;
  status_fa: string;
  reserve_date_jalali: string;
  reserve_day_name: string;
  quantity: number;
  unit_price: number;
  total_paid: number;
  food_image_url?: string | null;
}

export interface ReservationUpcomingResponse {
  data?: { items: ReservationUpcomingItem[]; pagination: { total: number } };
}

export interface CancelReservationResponse {
  status: number;
  message?: string;
}

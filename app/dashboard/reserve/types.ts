export interface ReserveCartItem {
  id: number | string;
  food_id?: number;
  name: string;
  day: string;
  jalali_date: string;
  date: string;
  type?: ReserveFoodType;
  type_fa?: string;
  reserved_food_day?: boolean;
  count: number;
  price: number;
}

export type ReserveFoodType =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "drink"
  | "appetizer";

export const isMainFoodType = (type?: string) =>
  type === "breakfast" || type === "lunch" || type === "dinner";

export interface UnreviewedReservation {
  id: number;
  food_id: number;
  food_name: string;
  status: string;
  has_feedback: {
    has_feedback: boolean;
    rate: number | null;
    comment: string | null;
    status: string | null;
  };
}

export interface ReserveFood {
  food_id: number;
  weekly_menu_id: number;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  feedback_rate: number | string | null;
  feedback_count: number;
  comment_count: number;
  is_reserved: boolean;
  reserved_count: number;
  max_reservation_quantity: number;
}

export interface ReserveFoodGroup {
  type: ReserveFoodType;
  type_fa: string;
  items: ReserveFood[];
}

export interface ReserveDay {
  date: string;
  day_name: string;
  jalali_date: string;
  reserved_food_day: boolean;
  foods: ReserveFoodGroup[];
}

export interface ReserveWeek {
  range: string;
  is_current_week: boolean;
  week_number: number;
  reservation_message?: string | null;
  days: ReserveDay[];
}

export interface FoodReserveList {
  weeks: ReserveWeek[];
}

export interface WeeklyMenuResponse {
  data?: FoodReserveList | null;
}

export interface SelectedReserveFood {
  food: ReserveFood;
  group: ReserveFoodGroup;
  day: ReserveDay;
}

// The OpenAPI endpoint documents food_id but does not define its response schema.
// These fields follow the feedback response already consumed by this project.
export interface FoodFeedbackItem {
  rate: number | string;
  created_day_name: string;
  created_at_jalali: string;
  comment: string | null;
}

export interface FoodFeedbackData {
  food_name: string;
  feedback_rate: number | string | null;
  feedback_count: number;
  comment_count: number;
  image_url: string | null;
  feedbacks: FoodFeedbackItem[];
}

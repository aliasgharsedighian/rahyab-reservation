export interface ReserveCartItem {
  id: number | string;
  food_id?: number;
  name: string;
  day: string;
  jalali_date: string;
  date: string;
  type?: ReserveFoodType;
  type_fa?: string;
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

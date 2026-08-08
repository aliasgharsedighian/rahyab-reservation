export interface ReserveCartItem {
  id: number | string;
  name: string;
  day: string;
  jalali_date: string;
  count: number;
  price: number;
}

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

// OpenAPI specifies mutation fields, but omits the profile/preferences response schemas.
// Read-only fields and statistics follow the response already consumed by this page.
export interface FoodPreferences { id: number; name: string; description: string; }
export interface Profile {
  id: number;
  name: string;
  family: string;
  mobile: string;
  email: string | null;
  employee_code: string;
  company_name: string;
  departeman_name: string;
  wallet_balance: number;
  avatar_url: string | null;
  is_admin: boolean;
  description: string | null;
  food_preferences: FoodPreferences[];
  servings_ordered_last_month: number;
  reserved_total_paid_last_month: number;
  servings_ordered_total: number;
  reserved_total_paid_total: number;
  reservation_feedbacks_count: number;
}
export interface ProfileFormValues extends Omit<Profile, "description"> {
  description: string;
  current_password: string;
  password: string;
  password_confirmation: string;
}
export interface ProfileResponse { data?: Profile; }
export interface FoodPreferencesResponse { data?: FoodPreferences[]; }
export interface ProfileMutationResponse { message: string; status?: number; }

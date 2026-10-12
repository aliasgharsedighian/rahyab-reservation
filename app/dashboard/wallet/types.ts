// OpenAPI names the wallet totals and transaction list, but omits response schemas.
// Transaction fields retain the contract already consumed by this screen.
export interface WalletTransaction {
  id: number;
  type: "افزایش" | "کاهش";
  amount: number;
  description: string;
  created_at: string;
  created_at_jalali: string;
  created_day_name: string;
}

export interface WalletData {
  balance: number;
  total_credit: number;
  total_debit: number;
  transactions: WalletTransaction[];
  pagination: { total: number };
}

export interface WalletResponse { data?: WalletData; }

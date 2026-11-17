import "server-only";

import { serverApiFetch } from "@/lib/api/server";
import type { ErrorOccurrence } from "@/lib/analytics-errors";

interface WalletBalanceResponse {
  data: {
    balance: number;
  };
}

export async function getWalletBalance(errorEvents: ErrorOccurrence[]) {
  const response = await serverApiFetch("wallet?count=1&page=1", {}, errorEvents);
  if (!response.ok) return null;

  const wallet: WalletBalanceResponse = await response.json();
  return wallet.data.balance;
}

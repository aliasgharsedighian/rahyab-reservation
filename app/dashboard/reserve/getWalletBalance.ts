import "server-only";

import { serverApiFetch } from "@/lib/api/server";

interface WalletBalanceResponse {
  data: {
    balance: number;
  };
}

export async function getWalletBalance() {
  const response = await serverApiFetch("wallet?count=1&page=1");
  if (!response.ok) return null;

  const wallet: WalletBalanceResponse = await response.json();
  return wallet.data.balance;
}

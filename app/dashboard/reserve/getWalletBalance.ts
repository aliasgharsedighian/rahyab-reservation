import "server-only";

import { cookies } from "next/headers";

interface WalletBalanceResponse {
  data: {
    balance: number;
  };
}

export async function getWalletBalance() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_token")?.value;
  const headers = new Headers();
  headers.append("Accept", "application/json");
  headers.append("Authorization", `Bearer ${token}`);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ADDRESS}wallet?count=1&page=1`,
      { method: "GET", headers },
    );
    if (!response.ok) return null;

    const wallet: WalletBalanceResponse = await response.json();
    return wallet.data.balance;
  } catch (error) {
    console.error("Failed to fetch the wallet balance:", error);
    return null;
  }
}

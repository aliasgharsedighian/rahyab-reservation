import { cookies } from "next/headers";
import ClientReservePage from "./components/ClientReservePage";
import DashboardHeader from "../components/DashboardHeader";
import { getWalletBalance } from "./getWalletBalance";

const getReserveList = async () => {
  const cookieStore = await cookies();
  const browserId = cookieStore.get("user_token")?.value;
  const headers = new Headers();
  headers.append("Accept", "application/json");
  headers.append("Authorization", `Bearer ${browserId}`);
  const requestOptions = {
    method: "GET",
    headers,
  };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADDRESS}weekly-menu`,
    requestOptions,
  );

  const reserveList = await res.json();
  if (res.status === 200) {
    return reserveList.data;
  }
};

export default async function ReservePage() {
  const [reserveList, walletBalance] = await Promise.all([
    getReserveList(),
    getWalletBalance(),
  ]);

  return (
    <div className="flex flex-col gap-6 w-full mb-40 md:mb-10">
      <DashboardHeader title={"رزرو غذا"} />
      <ClientReservePage
        reserveList={reserveList}
        walletBalance={walletBalance}
      />
    </div>
  );
}

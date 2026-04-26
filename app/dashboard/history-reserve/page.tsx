import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

interface Props {
  searchParams: Promise<{
    open: string;
  }>;
}

const getReserveHistory = async () => {
  const cookieStore = await cookies();
  const browserId = cookieStore.get("user_token")?.value;
  var myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Authorization", `Bearer ${browserId}`);
  var requestOptions = {
    method: "GET",
    headers: myHeaders,
  };
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ADDRESS}reservations/history`,
    requestOptions,
  );

  const profile = await res.json();
  if (res.status === 200) {
    return profile.data;
  }
};

export default async function HistoryReservePage({ searchParams }: Props) {
  const { open } = await searchParams;

  const reserveHistory = await getReserveHistory();

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/profile`);
  }

  return (
    <div>
      {reserveHistory.map((item: any, index: number) => (
        <div key={index}>{item.date}</div>
      ))}
    </div>
  );
}

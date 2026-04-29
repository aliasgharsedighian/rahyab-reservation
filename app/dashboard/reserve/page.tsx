import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { revalidatePath } from "next/cache";
import FoodReserveCart from "./components/FoodReserveCart";
import FoodReserveTabs from "./components/FoodReserveTabs";

interface Props {
  searchParams: Promise<{
    open: string;
  }>;
}

const getReserveList = async () => {
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
    `${process.env.NEXT_PUBLIC_API_ADDRESS}weekly-menu`,
    requestOptions,
  );

  const reserveList = await res.json();
  if (res.status === 200) {
    return reserveList.data;
  }
};

export default async function ReservePage({ searchParams }: Props) {
  const { open } = await searchParams;

  const reserveList = await getReserveList();

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/reserve`);
  }

  async function refreshPage() {
    "use server";

    refresh();
  }

  return (
    <div className="flex gap-6">
      <div className="basis-8/12">
        <FoodReserveTabs reserveList={reserveList} />
      </div>
      <div className="basis-4/12 w-full">
        <FoodReserveCart
          revalidateData={revalidateData}
          refresh={refreshPage}
        />
      </div>
    </div>
  );
}

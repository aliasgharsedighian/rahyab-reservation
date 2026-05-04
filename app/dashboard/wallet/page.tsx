import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import DashboardHeader from "../components/DashboardHeader";
import DashboardPagination from "../components/DashboardPagination";
import WalletTable from "./components/WalletTable";
import { PlusIcon, Wallet2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  searchParams: Promise<{
    page: string;
  }>;
}

const getWalletDetail = async (per_page: string = "10", page: string = "1") => {
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
    `${process.env.NEXT_PUBLIC_API_ADDRESS}wallet?per_page=${per_page}&page=${page}`,
    requestOptions,
  );

  const wallet = await res.json();
  if (res.status === 200) {
    return wallet.data;
  }
};

export default async function WalletPage({ searchParams }: Props) {
  const per_page = "10";
  const { page } = await searchParams;

  const wallet = await getWalletDetail(per_page, page);

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/wallet`);
  }

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <DashboardHeader title={"کیف پول"} />
      <div className="w-full md:mx-6 flex items-center gap-4">
        <div className="w-full bg-zinc-900 text-white flex flex-col gap-4 border md:basis-1/3 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center justify-center">
              <p>موجودی قابل استفاده</p>
              <span>{wallet.balance.toLocaleString()} تومان</span>
            </div>
            <Wallet2Icon />
          </div>
          <Button className="w-fit text-black bg-white">
            {" "}
            <PlusIcon /> افزایش اعتبار
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        {wallet.transactions.length === 0 ? (
          <div className="w-full flex flex-col gap-3">
            <p>لیست رزروهای شما خالی است.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mx-2 md:mx-6">
            <WalletTable walletList={wallet?.transactions} />
            <DashboardPagination
              per_page={per_page}
              page={page}
              posts={per_page}
            />
          </div>
        )}
      </div>
    </div>
  );
}

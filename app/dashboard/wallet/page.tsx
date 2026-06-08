import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import DashboardHeader from "../components/DashboardHeader";
import DashboardPagination from "../components/DashboardPagination";
import WalletTable from "./components/WalletTable";
import { MinusIcon, PlusIcon, Wallet2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddCreditModal from "./components/AddCreditModal";

interface Props {
  searchParams: Promise<{
    page: string;
    created_at_from_jalali: string;
    created_at_to_jalali: string;
    status: string;
  }>;
}

const getWalletDetail = async (
  per_page: string = "10",
  page: string = "1",
  created_at_from_jalali: string,
  created_at_to_jalali: string,
  status: string,
) => {
  const params = new URLSearchParams();
  params.set("count", String(per_page));
  params.set("page", String(page));
  if (created_at_from_jalali) {
    params.set("created_at_from_jalali", created_at_from_jalali);
  }

  if (created_at_to_jalali) {
    params.set("created_at_to_jalali", created_at_to_jalali);
  }

  if (status) {
    params.set("status", status);
  }
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
    `${process.env.NEXT_PUBLIC_API_ADDRESS}wallet?${params.toString()}`,
    requestOptions,
  );

  const wallet = await res.json();
  if (res.status === 200) {
    return wallet.data;
  }
};

export default async function WalletPage({ searchParams }: Props) {
  const per_page = "6";
  const { page, created_at_from_jalali, created_at_to_jalali, status } =
    await searchParams;

  const wallet = await getWalletDetail(
    per_page,
    page,
    created_at_from_jalali,
    created_at_to_jalali,
    status,
  );

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/wallet`);
  }

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <DashboardHeader title={"کیف پول"} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:mx-6">
        {/* Balance */}
        <div className="rounded-xl border bg-(--light-green) p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                موجودی قابل استفاده
              </p>
              <h3 className="mt-2 text-xl font-bold">
                {wallet.balance.toLocaleString()} تومان
              </h3>
            </div>

            <div className="rounded-full bg-background/70 p-3">
              <Wallet2Icon className="size-5" />
            </div>
          </div>

          <AddCreditModal />
        </div>

        {/* Total Credit */}
        <div className="rounded-xl border bg-green-50 p-5 dark:bg-(--light-green)">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">مجموع واریزی‌ها</p>
              <h3 className="mt-2 text-xl font-bold text-green-800">
                {wallet.total_credit.toLocaleString()} تومان
              </h3>
            </div>

            <div className="rounded-full bg-green-100 p-3">
              <PlusIcon className="size-5 text-green-700" />
            </div>
          </div>
        </div>

        {/* Total Debit */}
        <div className="rounded-xl border bg-red-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700">مجموع هزینه‌ها</p>
              <h3 className="mt-2 text-xl font-bold text-red-800">
                {wallet.total_debit.toLocaleString()} تومان
              </h3>
            </div>

            <div className="rounded-full bg-red-100 p-3">
              <MinusIcon className="size-5 text-red-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <div className="flex flex-col gap-4 mx-2 md:mx-6">
          <div className="mb-6 flex flex-col gap-3">
            <h2 className="text-2xl font-bold">تراکنش‌های کیف پول</h2>
            <p className="text-(--secondary-text)">
              لیست دریافتی‌ها و پرداختی‌های شما
            </p>
          </div>
          <WalletTable
            walletList={wallet?.transactions}
            revalidateData={revalidateData}
          />
          <DashboardPagination
            per_page={per_page}
            page={page}
            posts={wallet?.pagination.total || per_page}
          />
        </div>
      </div>
    </div>
  );
}

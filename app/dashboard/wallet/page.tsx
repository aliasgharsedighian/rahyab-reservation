import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/api/server";
import DashboardHeader from "../components/DashboardHeader";
import DashboardPagination from "../components/DashboardPagination";
import WalletTable from "./components/WalletTable";
import WalletSummary from "./components/WalletSummary";
import type { WalletResponse } from "./types";

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
  const res = await serverApiFetch(`wallet?${params.toString()}`);

  const wallet: WalletResponse = await res.json();
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

  if (!wallet) return;

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <DashboardHeader title={"کیف پول"} />
      <div className="mx-2 md:mx-6"><div className="mx-auto w-full max-w-5xl"><WalletSummary wallet={wallet} /></div></div>

      <div className="w-full flex flex-col gap-3">
        <div className="mx-2 flex min-w-0 flex-col gap-4 md:mx-6">
          <div className="mx-auto w-full max-w-5xl space-y-5">
            <div className="mb-2 flex flex-col gap-2">
              <h2 className="text-2xl font-bold sm:text-3xl">تراکنش‌های کیف پول</h2>
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
    </div>
  );
}

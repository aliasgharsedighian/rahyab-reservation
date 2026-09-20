import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/api/server";
import ClientProfilePage from "./components/ClientProfilePage";
import DashboardHeader from "../components/DashboardHeader";

interface Props {
  searchParams: Promise<{
    open: string;
  }>;
}

const getProfileInfo = async () => {
  const res = await serverApiFetch("profile");

  const profile = await res.json();
  if (res.status === 200) {
    return profile.data;
  }
};

const getFoodPreferences = async () => {
  const res = await serverApiFetch("food-preferences");

  const foodPreferences = await res.json();
  if (res.status === 200) {
    return foodPreferences.data;
  }
};

export default async function ProfilePage({ searchParams }: Props) {
  const { open } = await searchParams;

  const profile = await getProfileInfo();
  const foodPreferences = await getFoodPreferences();

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/profile`);
  }

  return (
    <div className="flex flex-col gap-6 w-full mb-40 md:mb-10">
      <DashboardHeader title={"پروفایل کاربری"} />
      <ClientProfilePage
        profile={profile}
        foodPreferences={foodPreferences}
        revalidateData={revalidateData}
      />
    </div>
  );
}

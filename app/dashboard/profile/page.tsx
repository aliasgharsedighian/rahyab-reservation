import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/api/server";
import ClientProfilePage from "./components/ClientProfilePage";
import DashboardHeader from "../components/DashboardHeader";
import type { FoodPreferencesResponse, ProfileResponse } from "./types";

interface Props {
  searchParams: Promise<{
    open: string;
  }>;
}

const getProfileInfo = async () => {
  const res = await serverApiFetch("profile");

  const profile: ProfileResponse = await res.json();
  if (res.status === 200) {
    return profile.data;
  }
};

const getFoodPreferences = async () => {
  const res = await serverApiFetch("food-preferences");

  const foodPreferences: FoodPreferencesResponse = await res.json();
  if (res.status === 200) {
    return foodPreferences.data;
  }
};

export default async function ProfilePage({ searchParams }: Props) {
  await searchParams;

  const profile = await getProfileInfo();
  const foodPreferences = await getFoodPreferences();

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/profile`);
  }

  if (!profile || !foodPreferences) return;

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <DashboardHeader title={"پروفایل کاربری"} />
      <ClientProfilePage
        profile={profile}
        foodPreferences={foodPreferences}
        revalidateData={revalidateData}
      />
    </div>
  );
}

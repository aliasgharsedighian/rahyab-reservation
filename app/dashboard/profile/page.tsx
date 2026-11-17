import { revalidatePath } from "next/cache";
import { serverApiFetch } from "@/lib/api/server";
import AnalyticsErrorEvents from "@/app/components/AnalyticsErrorEvents";
import ApiLoadFailure from "@/app/components/ApiLoadFailure";
import type { ErrorOccurrence } from "@/lib/analytics-errors";
import ClientProfilePage from "./components/ClientProfilePage";
import DashboardHeader from "../components/DashboardHeader";
import type { FoodPreferencesResponse, ProfileResponse } from "./types";

interface Props {
  searchParams: Promise<{
    open: string;
  }>;
}

const getProfileInfo = async (errorEvents: ErrorOccurrence[]) => {
  const res = await serverApiFetch("profile", {}, errorEvents);

  if (res.status === 200) {
    const profile: ProfileResponse = await res.json();
    return profile.data;
  }
};

const getFoodPreferences = async (errorEvents: ErrorOccurrence[]) => {
  const res = await serverApiFetch("food-preferences", {}, errorEvents);

  if (res.status === 200) {
    const foodPreferences: FoodPreferencesResponse = await res.json();
    return foodPreferences.data;
  }
};

export default async function ProfilePage({ searchParams }: Props) {
  await searchParams;

  const errorEvents: ErrorOccurrence[] = [];
  const profile = await getProfileInfo(errorEvents);
  const foodPreferences = await getFoodPreferences(errorEvents);

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/profile`);
  }

  if (!profile || !foodPreferences) {
    return (
      <>
        <AnalyticsErrorEvents events={errorEvents} />
        {errorEvents.length > 0 && <ApiLoadFailure />}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <AnalyticsErrorEvents events={errorEvents} />
      <DashboardHeader title={"پروفایل کاربری"} />
      <ClientProfilePage
        profile={profile}
        foodPreferences={foodPreferences}
        revalidateData={revalidateData}
      />
    </div>
  );
}

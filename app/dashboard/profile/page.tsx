import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import ClientProfilePage from "./components/ClientProfilePage";
import DashboardHeader from "../components/DashboardHeader";

interface Props {
  searchParams: Promise<{
    open: string;
  }>;
}

const getProfileInfo = async () => {
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
    `${process.env.NEXT_PUBLIC_API_ADDRESS}profile`,
    requestOptions,
  );

  const profile = await res.json();
  if (res.status === 200) {
    return profile.data;
  }
};

export default async function ProfilePage({ searchParams }: Props) {
  const { open } = await searchParams;

  const profile = await getProfileInfo();

  async function revalidateData() {
    "use server";

    revalidatePath(`/dashboard/profile`);
  }

  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <DashboardHeader title={"پروفایل کاربری"} />
      <ClientProfilePage profile={profile} revalidateData={revalidateData} />
    </div>
  );
}

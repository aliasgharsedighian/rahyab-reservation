"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function loginCookiesAction(
  token: any,
  registered: boolean,
) {
  const cookieStore = await cookies();
  cookieStore.set("user_token", token);
  if (registered) {
    redirect("/dashboard/reserve");
  } else {
    redirect("/dashboard/profile");
  }
}

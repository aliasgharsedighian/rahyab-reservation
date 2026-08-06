"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function loginCookiesAction(
  token: string,
  registered: boolean,
) {
  const cookieStore = await cookies();
  cookieStore.set("user_token", token);
  if (registered) {
    redirect("/dashboard/reserve?walletGuide=1");
  } else {
    redirect("/dashboard/profile?walletGuide=1");
  }
}

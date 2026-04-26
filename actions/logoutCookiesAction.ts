"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function logoutCookiesAction() {
  const cookieStore = await cookies();
  cookieStore.delete("user_token");
}

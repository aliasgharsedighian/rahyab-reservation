"use server";

import { cookies } from "next/headers";

export default async function getAuthTokenAction() {
  const cookieStore = await cookies();
  return cookieStore.get("user_token")?.value ?? null;
}

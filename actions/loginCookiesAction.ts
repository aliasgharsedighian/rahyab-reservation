"use server";

import { cookies } from "next/headers";

const REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30;

export default async function loginCookiesAction(
  token: string,
  rememberMe: boolean,
) {
  const cookieStore = await cookies();
  cookieStore.set("user_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    priority: "high",
    ...(rememberMe ? { maxAge: REMEMBER_ME_MAX_AGE } : {}),
  });
}

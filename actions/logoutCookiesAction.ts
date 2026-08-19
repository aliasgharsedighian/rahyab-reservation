"use server";

import { cookies } from "next/headers";

export default async function logoutCookiesAction() {
  const cookieStore = await cookies();
  cookieStore.set("user_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

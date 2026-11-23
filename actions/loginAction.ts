"use server";

import { toEnglishDigits } from "@/lib/digits";
import { getAnalyticsUserId } from "@/lib/analytics-identity";
import { getFetchErrorCode, getTechnicalErrorCode, type ErrorCode } from "@/lib/analytics-errors";
import loginCookiesAction from "./loginCookiesAction";

interface LoginCredentials {
  mobile: string;
  password: string;
}

type LoginResponse =
  | {
      success: true;
      message: string;
      analyticsUserId: string | null;
      data: {
        token: string;
        user: unknown;
      };
    }
  | {
      success: false;
      message: string;
      errorCode?: ErrorCode;
      fieldError?: { name: keyof LoginCredentials; message: string };
    };

export default async function loginAction(
  formData: LoginCredentials,
  rememberMe: boolean,
): Promise<LoginResponse> {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  const myFormdata = new FormData();
  myFormdata.append("mobile", toEnglishDigits(formData.mobile).trim());
  myFormdata.append("password", formData.password);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ADDRESS}auth/login`,
      {
        method: "POST",
        headers: myHeaders,
        body: myFormdata,
        credentials: "include",
      },
    );
    const result = await response.json().catch(() => null);
    const errorCode = getTechnicalErrorCode(response.status, result);
    if (errorCode || !result) {
      return {
        success: false,
        message: result?.message || "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
        errorCode: errorCode ?? "invalid_response",
      };
    }
    if (response.ok && result.status === 200 && result.data?.token) {
      await loginCookiesAction(result.data.token, rememberMe);
      return {
        success: true,
        message: result.message,
        analyticsUserId: getAnalyticsUserId(result.data.user),
        data: result.data,
      };
    }
    const message = result.message || "ورود ناموفق بود.";
    const status = response.ok ? result.status : response.status;
    const mobileError = result.errors?.mobile?.[0];
    const passwordError = result.errors?.password?.[0];
    return {
      success: false,
      message,
      fieldError: typeof mobileError === "string"
        ? { name: "mobile", message: mobileError }
        : typeof passwordError === "string" || status === 400 || status === 401 || status === 422
          ? { name: "password", message: typeof passwordError === "string" ? passwordError : message }
          : undefined,
    };
  } catch (error) {
    console.error("Login request failed", error);
    return {
      success: false,
      message: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
      errorCode: getFetchErrorCode(error),
    };
  }
}

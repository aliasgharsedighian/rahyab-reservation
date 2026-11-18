"use server";

import { getApiUrl } from "@/lib/api/url";
import { getAnalyticsUserId } from "@/lib/analytics-identity";
import { getFetchErrorCode, getTechnicalErrorCode, type ErrorCode } from "@/lib/analytics-errors";
import { normalizeOtpDigits, otpCodePattern, otpMobilePattern } from "@/lib/otp-login";
import loginCookiesAction from "./loginCookiesAction";

type OtpResponse = {
  status?: number;
  message?: string;
  errors?: Partial<Record<"mobile" | "code", string[]>>;
  data?: { token?: string; user?: unknown };
};

async function postOtp(path: "auth/otp" | "auth/otp/verify", payload: { mobile: string; code?: string }) {
  const response = await fetch(getApiUrl(path), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body: OtpResponse | null = await response.json().catch(() => null);
  const errorCode = getTechnicalErrorCode(response.status, body);
  return {
    ok: !errorCode && response.ok && body !== null && (body.status === undefined || body.status === 200),
    body,
    status: response.ok ? body?.status ?? response.status : response.status,
    errorCode: errorCode ?? (response.ok && body === null ? "invalid_response" as const : undefined),
  };
}

type OtpFailure = { success: false; message: string; errorCode?: ErrorCode; terminal?: boolean };
const invalidMobile: OtpFailure = { success: false, message: "شماره موبایل را با فرمت ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید." };
const connectionError = { success: false, message: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید." } as const;

export async function requestLoginOtp(mobile: string) {
  mobile = normalizeOtpDigits(mobile);
  if (!otpMobilePattern.test(mobile)) return invalidMobile;

  try {
    const { ok, body, errorCode } = await postOtp("auth/otp", { mobile });
    if (!ok) {
      return {
        success: false as const,
        message: body?.errors?.mobile?.[0] || body?.message || "ارسال کد ناموفق بود.",
        errorCode,
      };
    }

    return { success: true as const, message: body?.message };
  } catch (error) {
    return { ...connectionError, errorCode: getFetchErrorCode(error) };
  }
}

export async function verifyLoginOtp(mobile: string, code: string) {
  mobile = normalizeOtpDigits(mobile);
  code = normalizeOtpDigits(code);
  if (!otpMobilePattern.test(mobile)) return invalidMobile;
  if (!otpCodePattern.test(code)) {
    return { success: false, message: "کد تأیید باید ۴ رقم باشد." } satisfies OtpFailure;
  }

  try {
    const { ok, body, errorCode, status } = await postOtp("auth/otp/verify", { mobile, code });
    const token = body?.data?.token;
    if (!ok || typeof token !== "string" || !token) {
      return {
        success: false as const,
        message: body?.errors?.code?.[0] || body?.errors?.mobile?.[0] ||
          body?.message || "تأیید کد ناموفق بود.",
        errorCode: errorCode ?? (ok ? "invalid_response" as const : undefined),
        // A generic 422 can still be an incorrect code with retries remaining.
        terminal: !errorCode && (status === 403 || status === 410 || status === 423),
      };
    }

    await loginCookiesAction(token, true);
    return {
      success: true as const,
      message: body?.message,
      analyticsUserId: getAnalyticsUserId(body?.data?.user),
      data: { token, user: body?.data?.user },
    };
  } catch (error) {
    return { ...connectionError, errorCode: getFetchErrorCode(error) };
  }
}

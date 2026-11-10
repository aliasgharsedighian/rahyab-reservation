"use server";

import { getApiUrl } from "@/lib/api/url";
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
  return {
    ok: response.ok && (body?.status === undefined || body.status === 200),
    body,
  };
}

const invalidMobile = { success: false, message: "شماره موبایل را با فرمت ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید." } as const;
const connectionError = { success: false, message: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید." } as const;

export async function requestLoginOtp(mobile: string) {
  mobile = normalizeOtpDigits(mobile);
  if (!otpMobilePattern.test(mobile)) return invalidMobile;

  try {
    const { ok, body } = await postOtp("auth/otp", { mobile });
    if (!ok) {
      return {
        success: false as const,
        message: body?.errors?.mobile?.[0] || body?.message || "ارسال کد ناموفق بود.",
      };
    }

    return { success: true as const, message: body?.message };
  } catch {
    return connectionError;
  }
}

export async function verifyLoginOtp(mobile: string, code: string) {
  mobile = normalizeOtpDigits(mobile);
  code = normalizeOtpDigits(code);
  if (!otpMobilePattern.test(mobile)) return invalidMobile;
  if (!otpCodePattern.test(code)) {
    return { success: false as const, message: "کد تأیید باید ۴ رقم باشد." };
  }

  try {
    const { ok, body } = await postOtp("auth/otp/verify", { mobile, code });
    const token = body?.data?.token;
    if (!ok || typeof token !== "string" || !token) {
      return {
        success: false as const,
        message: body?.errors?.code?.[0] || body?.errors?.mobile?.[0] ||
          body?.message || "تأیید کد ناموفق بود.",
      };
    }

    await loginCookiesAction(token, true);
    return {
      success: true as const,
      message: body?.message,
      data: { token, user: body?.data?.user },
    };
  } catch {
    return connectionError;
  }
}

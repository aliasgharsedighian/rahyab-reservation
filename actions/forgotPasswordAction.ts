"use server";

import { getApiUrl } from "@/lib/api/url";
import { toEnglishDigits } from "@/lib/digits";
import { getRecoveryMobileError, getRecoveryResetErrors, type RecoveryFieldErrors } from "@/lib/password-recovery";
import logoutCookiesAction from "./logoutCookiesAction";

type RecoveryResponse = {
  success?: boolean;
  status?: number;
  message?: string;
  data?: { expires_in?: number; resend_after?: number; changed?: boolean };
  errors?: { retry_after?: number; mobile?: string[]; code?: string[]; password?: string[]; password_confirmation?: string[] };
};

type RecoveryFailure = {
  success: false;
  message: string;
  retryAfter?: number;
  needsNewCode?: boolean;
  fieldErrors?: RecoveryFieldErrors;
};

const connectionError: RecoveryFailure = {
  success: false,
  message: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
};

function normalize(value: string) {
  return typeof value === "string" ? toEnglishDigits(value).trim() : "";
}

function validDuration(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

async function postRecovery(path: string, payload: Record<string, string>) {
  const response = await fetch(getApiUrl(path), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  const body: RecoveryResponse | null = await response.json().catch(() => null);
  const status = response.ok ? body?.status ?? response.status : response.status;
  return { body, status, ok: response.ok && status === 200 && body?.success === true };
}

function failure(
  status: number,
  body: RecoveryResponse | null,
  fallback: string,
): RecoveryFailure {
  const retryAfter = body?.errors?.retry_after;
  return {
    success: false,
    message: body?.message || fallback,
    retryAfter: status === 429 && validDuration(retryAfter) ? retryAfter : undefined,
  };
}

export async function requestPasswordRecovery(mobile: string) {
  mobile = normalize(mobile);
  const mobileError = getRecoveryMobileError(mobile);
  if (mobileError) {
    return { success: false, message: mobileError, fieldErrors: { mobile: mobileError } } satisfies RecoveryFailure;
  }

  try {
    const { body, status, ok } = await postRecovery("auth/forgot-password", { mobile });
    const expiresIn = body?.data?.expires_in;
    const resendAfter = body?.data?.resend_after;
    if (ok && validDuration(expiresIn) && expiresIn > 0 && validDuration(resendAfter)) {
      return {
        success: true as const,
        message: body?.message || "کد بازیابی رمز عبور ارسال شد.",
        expiresIn,
        resendAfter,
      };
    }

    const messages: Record<number, string> = {
      403: "حساب کاربری غیرفعال است.",
      422: body?.errors?.mobile?.[0] || "شماره موبایل نامعتبر است یا در سیستم ثبت نشده است.",
      429: "برای درخواست مجدد کد بازیابی کمی صبر کنید.",
      436: "تعداد درخواست‌های ارسال کد از حد مجاز بیشتر شده است.",
    };
    const result = failure(status, ok ? null : body, messages[status] || "ارسال کد بازیابی ناموفق بود. دوباره تلاش کنید.");
    if (status === 422) {
      result.fieldErrors = { mobile: body?.errors?.mobile?.[0] || result.message };
    }
    return result;
  } catch {
    return connectionError;
  }
}

export async function resetRecoveredPassword(
  mobile: string,
  code: string,
  password: string,
  passwordConfirmation: string,
) {
  mobile = normalize(mobile);
  code = normalize(code);
  const fieldErrors = getRecoveryResetErrors(code, password, passwordConfirmation);
  const mobileError = getRecoveryMobileError(mobile);
  if (mobileError) fieldErrors.mobile = mobileError;
  const [firstError] = Object.values(fieldErrors);
  if (firstError) {
    return { success: false, message: firstError, fieldErrors } satisfies RecoveryFailure;
  }

  try {
    const { body, status, ok } = await postRecovery("auth/forgot-password/reset", {
      mobile,
      code,
      password,
      password_confirmation: passwordConfirmation,
    });
    if (ok && body?.data?.changed === true) {
      await logoutCookiesAction();
      return { success: true as const, message: body.message || "رمز عبور با موفقیت تغییر کرد." };
    }

    const fallback = status === 429
      ? "برای تلاش مجدد جهت تأیید کد کمی صبر کنید."
      : body?.errors?.code?.[0] || body?.errors?.password?.[0] || "تغییر رمز عبور ناموفق بود.";
    const result = failure(status, ok ? null : body, fallback);
    if (status === 422) {
      result.needsNewCode = body?.message?.includes("کد جدید دریافت کنید") ?? false;
      const errors = {
        mobile: body?.errors?.mobile?.[0],
        code: body?.errors?.code?.[0],
        password: body?.errors?.password?.[0],
        confirmation: body?.errors?.password_confirmation?.[0],
      };
      if (Object.values(errors).some(Boolean)) {
        result.fieldErrors = errors;
      } else if (!result.needsNewCode) {
        result.fieldErrors = { code: result.message };
      }
    }
    return result;
  } catch {
    return connectionError;
  }
}

import { toEnglishDigits } from "@/lib/digits";

export const otpMobilePattern = /^09[0-9]{9}$/;
export const otpCodePattern = /^[0-9]{4}$/;

export function normalizeOtpDigits(value: unknown) {
  return typeof value === "string" ? toEnglishDigits(value).trim() : "";
}

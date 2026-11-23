import { toEnglishDigits } from "@/lib/digits";

export async function readSmsCode(signal: AbortSignal) {
  try {
    const options: CredentialRequestOptions & { otp: { transport: ["sms"] } } = {
      otp: { transport: ["sms"] },
      signal,
    };
    const credential = await navigator.credentials.get(options);
    if (credential && "code" in credential && typeof credential.code === "string") {
      return toEnglishDigits(credential.code).trim();
    }
  } catch {
    // Manual entry stays available if the browser denies or cancels WebOTP.
  }
  return "";
}

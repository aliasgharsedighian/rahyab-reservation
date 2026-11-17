"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { requestLoginOtp, verifyLoginOtp } from "@/actions/otpLoginAction";
import { logAnalyticsError } from "@/lib/analytics";
import { beginLoginAttempt, failLoginAttempt, type LoginAttempt } from "@/lib/auth-analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { normalizeOtpDigits, otpCodePattern, otpMobilePattern } from "@/lib/otp-login";

const resendDelay = 60;
const mobileLength = 11;

async function readSmsCode(signal: AbortSignal) {
  try {
    const options: CredentialRequestOptions & { otp: { transport: ["sms"] } } = {
      otp: { transport: ["sms"] },
      signal,
    };
    const credential = await navigator.credentials.get(options);
    return credential && "code" in credential ? normalizeOtpDigits(credential.code) : "";
  } catch {
    // Manual entry stays available if the browser denies or cancels WebOTP.
    return "";
  }
}

export function OtpLoginForm({
  active,
  onPendingChange,
  onLogin,
  onShowRules,
}: {
  active: boolean;
  onPendingChange: (pending: boolean) => void;
  onLogin: (
    data: { token: string; user: unknown },
    message?: string,
    toastId?: string | number,
    attempt?: LoginAttempt | null,
    analyticsUserId?: string | null,
  ) => void;
  onShowRules: () => void;
}) {
  const [mobile, setMobile] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"send" | "verify" | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const busy = useRef(false);
  const attempt = useRef<LoginAttempt | null>(null);
  const attemptPhone = useRef("");
  const attemptHasCode = useRef(false);
  const challengeAttempt = useRef<LoginAttempt | null>(null);
  const resendAt = useRef(0);
  const mobileOnCooldown = useRef("");
  const mobileInput = useRef<HTMLInputElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const smsRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    if (active) return () => smsRequest.current?.abort();
  }, [active]);

  useEffect(() => {
    if (sentTo) codeInput.current?.focus();
  }, [sentTo]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => {
      setSecondsLeft(Math.max(0, Math.ceil((resendAt.current - Date.now()) / 1000)));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  function changeMobile() {
    smsRequest.current?.abort();
    setSentTo("");
    setCode("");
    setError("");
    requestAnimationFrame(() => mobileInput.current?.focus());
  }

  async function submit({
    resend = false,
    recipient = sentTo,
    enteredCode = code,
  } = {}) {
    if (!active || busy.current) return;

    const verify = Boolean(recipient) && !resend;
    const phone = recipient || normalizeOtpDigits(mobile);
    if (!otpMobilePattern.test(phone)) {
      setError("شماره موبایل را با فرمت ۰۹۱۲۳۴۵۶۷۸۹ وارد کنید.");
      mobileInput.current?.focus();
      return;
    }
    if (verify && !otpCodePattern.test(enteredCode)) {
      setError("کد تأیید باید ۴ رقم باشد.");
      codeInput.current?.focus();
      return;
    }
    if (!verify && Date.now() < resendAt.current && phone === mobileOnCooldown.current) {
      if (!sentTo) {
        attempt.current = challengeAttempt.current;
        attemptPhone.current = phone;
        attemptHasCode.current = true;
        setSentTo(phone);
        setError("");
      }
      return;
    }

    smsRequest.current?.abort();
    busy.current = true;
    if (!verify && (!attempt.current || attemptPhone.current !== phone)) {
      attempt.current = beginLoginAttempt("otp");
      attemptPhone.current = phone;
      attemptHasCode.current = false;
    }
    setError("");
    setPending(verify ? "verify" : "send");
    onPendingChange(true);
    const toastId = toast.loading(verify ? "در حال بررسی کد..." : "در حال ارسال کد...");

    try {
      if (verify) {
        const result = await verifyLoginOtp(phone, enteredCode);
        if (result.success) {
          onLogin(result.data, result.message, toastId, attempt.current, result.analyticsUserId);
          return;
        }
        if ("terminal" in result && result.terminal) {
          failLoginAttempt(attempt.current);
          attempt.current = null;
          attemptHasCode.current = false;
          challengeAttempt.current = null;
          mobileOnCooldown.current = "";
          resendAt.current = 0;
          setSecondsLeft(0);
          changeMobile();
        }
        if ("errorCode" in result && result.errorCode) logAnalyticsError({ eventName: "api_error", operation: "verify_login_otp" }, result.errorCode);
        setError(result.message);
        toast.error(result.message, { id: toastId });
      } else {
        const controller = "OTPCredential" in window ? new AbortController() : null;
        smsRequest.current = controller;
        // Start listening before the request so a fast SMS can be picked up.
        const smsCode = controller ? readSmsCode(controller.signal) : null;
        const result = await requestLoginOtp(phone);
        if (!result.success) {
          if (!attemptHasCode.current) {
            failLoginAttempt(attempt.current);
            attempt.current = null;
          }
          if (result.errorCode) logAnalyticsError({ eventName: "api_error", operation: "request_login_otp" }, result.errorCode);
          controller?.abort();
          setError(result.message);
          toast.error(result.message, { id: toastId });
          return;
        }
        attemptHasCode.current = true;
        challengeAttempt.current = attempt.current;
        mobileOnCooldown.current = phone;
        resendAt.current = Date.now() + resendDelay * 1000;
        setSecondsLeft(resendDelay);
        setSentTo(phone);
        setCode("");
        toast.success(result.message || "کد تأیید ارسال شد.", { id: toastId });
        void smsCode?.then((value) => {
          if (controller && !controller.signal.aborted && otpCodePattern.test(value)) {
            fillCode(value, phone);
          }
        });
      }
    } catch {
      if (!verify && !attemptHasCode.current) {
        failLoginAttempt(attempt.current);
        attempt.current = null;
      }
      smsRequest.current?.abort();
      const message = "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      busy.current = false;
      setPending(null);
      onPendingChange(false);
    }
  }

  function fillCode(value: string, recipient: string) {
    const normalized = normalizeOtpDigits(value);
    setCode(normalized);
    setError("");
    if (otpCodePattern.test(normalized)) {
      void submit({ recipient, enteredCode: normalized });
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3" aria-busy={pending !== null}>
      {sentTo ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-sm">
            <p id="otp-phone-description" className="text-(--secondary-text)">
              کد به <bdi dir="ltr" className="font-bold text-foreground">{sentTo}</bdi> ارسال شد.
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={changeMobile} disabled={pending !== null} className="gap-1 px-1 text-(--base-green)">
              <PencilIcon aria-hidden="true" className="size-4" />
              ویرایش شماره
            </Button>
          </div>
          <div className="space-y-2 text-center">
            <label htmlFor="login-otp" className="block text-sm font-medium">کد تأیید ۴ رقمی</label>
            <div dir="ltr">
              <InputOTP
                ref={codeInput}
                id="login-otp"
                name="code"
                value={code}
                onChange={(value) => fillCode(value, sentTo)}
                pasteTransformer={normalizeOtpDigits}
                pattern="^[0-9۰-۹٠-٩]+$"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={4}
                disabled={pending !== null}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "otp-phone-description otp-login-error" : "otp-phone-description"}
                containerClassName="justify-center"
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3].map((index) => (
                    <InputOTPSlot key={index} index={index} aria-invalid={Boolean(error)} className="size-12 rounded-lg border bg-background text-lg font-bold data-[active=true]:border-(--base-green) data-[active=true]:ring-(--base-green)/25" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label htmlFor="otp-mobile" className="block text-sm font-medium">شماره موبایل</label>
          <Input
            ref={mobileInput}
            id="otp-mobile"
            name="mobile"
            type="tel"
            dir="ltr"
            inputMode="tel"
            autoComplete="tel"
            placeholder="09123456789"
            value={mobile}
            maxLength={mobileLength}
            onChange={(event) => {
              setMobile(normalizeOtpDigits(event.target.value).replace(/[^0-9]/g, "").slice(0, mobileLength));
              setError("");
            }}
            disabled={pending !== null}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "otp-mobile-hint otp-login-error" : "otp-mobile-hint"}
            className="h-11 rounded-lg bg-background text-left focus-visible:ring-(--base-green)/25"
          />
          <p id="otp-mobile-hint" className="text-xs text-(--secondary-text)">کد ورود به این شماره پیامک می‌شود.</p>
        </div>
      )}

      {error && <p id="otp-login-error" role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending !== null} className="h-11 w-full rounded-lg bg-green-500 font-bold text-white hover:bg-green-600">
        {pending === "verify" ? "در حال تأیید..." : pending === "send" ? "در حال ارسال..." : sentTo ? "تأیید و ورود" : "دریافت کد ورود"}
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
        {sentTo && (
          <Button type="button" variant="ghost" size="sm" disabled={secondsLeft > 0 || pending !== null} onClick={() => void submit({ resend: true })} className="text-(--base-green)">
            {secondsLeft > 0 ? `ارسال مجدد تا ${secondsLeft.toLocaleString("fa-IR")} ثانیه` : "ارسال دوبارهٔ کد"}
          </Button>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={onShowRules} className="text-(--secondary-text)">
          قوانین و مقررات
        </Button>
      </div>
    </form>
  );
}

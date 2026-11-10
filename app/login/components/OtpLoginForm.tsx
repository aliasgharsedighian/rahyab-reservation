"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { PencilIcon, ShieldCheckIcon, SmartphoneIcon } from "lucide-react";
import { toast } from "sonner";

import { requestLoginOtp, verifyLoginOtp } from "@/actions/otpLoginAction";
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
  onLogin,
  onShowRules,
}: {
  onLogin: (
    data: { token: string; user: unknown },
    message?: string,
    toastId?: string | number,
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
  const resendAt = useRef(0);
  const mobileOnCooldown = useRef("");
  const mobileInput = useRef<HTMLInputElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const smsRequest = useRef<AbortController | null>(null);

  useEffect(() => () => smsRequest.current?.abort(), []);

  useEffect(() => {
    if (sentTo) codeInput.current?.focus();
    else mobileInput.current?.focus();
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
  }

  async function submit({
    resend = false,
    recipient = sentTo,
    enteredCode = code,
  } = {}) {
    if (busy.current) return;

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
        setSentTo(phone);
        setError("");
      }
      return;
    }

    smsRequest.current?.abort();
    busy.current = true;
    setError("");
    setPending(verify ? "verify" : "send");
    const toastId = toast.loading(verify ? "در حال بررسی کد..." : "در حال ارسال کد...");

    try {
      if (verify) {
        const result = await verifyLoginOtp(phone, enteredCode);
        if (result.success) {
          onLogin(result.data, result.message, toastId);
          return;
        }
        setError(result.message);
        toast.error(result.message, { id: toastId });
      } else {
        const controller = "OTPCredential" in window ? new AbortController() : null;
        smsRequest.current = controller;
        // Start listening before the request so a fast SMS can be picked up.
        const smsCode = controller ? readSmsCode(controller.signal) : null;
        const result = await requestLoginOtp(phone);
        if (!result.success) {
          controller?.abort();
          setError(result.message);
          toast.error(result.message, { id: toastId });
          return;
        }
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
      smsRequest.current?.abort();
      const message = "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.";
      setError(message);
      toast.error(message, { id: toastId });
    } finally {
      busy.current = false;
      setPending(null);
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
    <form onSubmit={handleSubmit} noValidate className="space-y-5" aria-busy={pending !== null}>
      <div className="flex items-center gap-3 rounded-xl border border-(--base-green)/25 bg-(--light-green) p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--base-green)/15 text-(--base-green)">
          {sentTo ? <ShieldCheckIcon aria-hidden="true" className="size-5" /> : <SmartphoneIcon aria-hidden="true" className="size-5" />}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-(--secondary-text)">
            {sentTo ? "مرحلهٔ ۲ از ۲" : "مرحلهٔ ۱ از ۲"}
          </p>
          <h2 className="text-sm font-bold">{sentTo ? "تأیید کد پیامکی" : "ورود با کد یک‌بارمصرف"}</h2>
        </div>
      </div>

      {sentTo ? (
        <div className="space-y-4">
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
            className="h-12 rounded-lg bg-background text-left focus-visible:ring-(--base-green)/25"
          />
          <p id="otp-mobile-hint" className="text-xs text-(--secondary-text)">کد ورود به این شماره پیامک می‌شود.</p>
        </div>
      )}

      {error && <p id="otp-login-error" role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending !== null} className="h-12 w-full rounded-lg bg-green-500 font-bold text-white hover:bg-green-600">
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

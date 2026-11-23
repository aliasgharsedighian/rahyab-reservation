"use client";

import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRightIcon, Clock3Icon, KeyRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { requestPasswordRecovery, resetRecoveredPassword } from "@/actions/forgotPasswordAction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { toEnglishDigits } from "@/lib/digits";
import { getRecoveryMobileError, getRecoveryResetErrors, type RecoveryFieldErrors } from "@/lib/password-recovery";
import { readSmsCode } from "@/lib/web-otp";

type Deadlines = { resendAt?: number; verifyAt?: number };

const formatNumber = new Intl.NumberFormat("fa-IR", { useGrouping: false });
const fieldClassName = "h-11 rounded-xl bg-background";

function formatDuration(seconds: number) {
  if (seconds < 60) return `${formatNumber.format(seconds)} ثانیه`;
  return `${formatNumber.format(Math.floor(seconds / 60))} دقیقه و ${formatNumber.format(seconds % 60)} ثانیه`;
}

function RecoveryFieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return <p id={id} role="alert" className="text-sm text-destructive">{message}</p>;
}

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <RecoveryFormFromQuery />
    </Suspense>
  );
}

function RecoveryFormFromQuery() {
  const searchParams = useSearchParams();
  const queryMobile = toEnglishDigits(searchParams.get("mobile") ?? "").trim();
  const initialMobile = /^\d{1,11}$/.test(queryMobile) ? queryMobile : "";
  return <RecoveryForm key={initialMobile} initialMobile={initialMobile} />;
}

function RecoveryForm({ initialMobile }: { initialMobile: string }) {
  const router = useRouter();
  const [mobile, setMobile] = useState(initialMobile);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [deadlines, setDeadlines] = useState<Record<string, Deadlines>>({});
  const [now, setNow] = useState(0);
  const [pending, setPending] = useState<"send" | "reset" | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<RecoveryFieldErrors>({});
  const codeInput = useRef<HTMLInputElement>(null);
  const smsRequest = useRef<AbortController | null>(null);

  const { resendAt = 0, verifyAt = 0 } = deadlines[mobile] ?? {};
  const hasCode = expiresAt > now;
  const hasExpiredCode = expiresAt > 0 && !hasCode;
  const resendSeconds = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const verifySeconds = Math.max(0, Math.ceil((verifyAt - now) / 1000));
  const expiresSeconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const timerRunning = hasCode || resendSeconds > 0 || verifySeconds > 0;

  useEffect(() => () => smsRequest.current?.abort(), []);

  useEffect(() => {
    if (hasCode) codeInput.current?.focus();
    if (hasExpiredCode) smsRequest.current?.abort();
  }, [hasCode, hasExpiredCode]);

  useEffect(() => {
    if (!timerRunning) return;
    const tick = () => setNow(Date.now());
    const interval = window.setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [timerRunning]);

  function clearResetFields() {
    setCode("");
    setPassword("");
    setConfirmation("");
  }

  function fillCode(value: string) {
    const normalized = toEnglishDigits(value).trim();
    if (/^\d{4}$/.test(normalized)) smsRequest.current?.abort();
    setCode(normalized);
    setFieldErrors((errors) => ({ ...errors, code: undefined }));
  }

  function updateDeadlines(mobileNumber: string, nextDeadlines: Deadlines) {
    setDeadlines((current) => ({
      ...current,
      [mobileNumber]: { ...current[mobileNumber], ...nextDeadlines },
    }));
  }

  async function sendCode() {
    if (pending || Date.now() < Math.max(expiresAt, resendAt)) return;
    setError("");
    const mobileError = getRecoveryMobileError(mobile);
    setFieldErrors(mobileError ? { mobile: mobileError } : {});
    if (mobileError) return;
    setPending("send");
    smsRequest.current?.abort();
    const controller = "OTPCredential" in window ? new AbortController() : null;
    smsRequest.current = controller;

    try {
      // Listen before requesting the SMS so a fast delivery can be picked up.
      const smsCode = controller ? readSmsCode(controller.signal) : null;
      const result = await requestPasswordRecovery(mobile);
      const receivedAt = Date.now();
      setNow(receivedAt);
      if (!result.success) {
        controller?.abort();
        if (result.retryAfter !== undefined) {
          updateDeadlines(mobile, { resendAt: receivedAt + result.retryAfter * 1000 });
        }
        setFieldErrors(result.fieldErrors ?? {});
        if (!result.fieldErrors) setError(result.message);
        return;
      }

      clearResetFields();
      const challengeExpiresAt = receivedAt + result.expiresIn * 60_000;
      setExpiresAt(challengeExpiresAt);
      updateDeadlines(mobile, { resendAt: receivedAt + result.resendAfter * 1000 });
      toast.success(result.message);
      void smsCode?.then((value) => {
        if (controller && !controller.signal.aborted && Date.now() < challengeExpiresAt && /^\d{4}$/.test(value)) {
          fillCode(value);
        }
      });
    } catch {
      controller?.abort();
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    } finally {
      setPending(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    if (!hasCode) {
      await sendCode();
      return;
    }
    const submittedAt = Date.now();
    setNow(submittedAt);
    if (submittedAt >= expiresAt || submittedAt < verifyAt) return;
    setError("");
    const resetErrors = getRecoveryResetErrors(code, password, confirmation);
    setFieldErrors(resetErrors);
    if (Object.keys(resetErrors).length > 0) return;
    smsRequest.current?.abort();
    setPending("reset");
    try {
      const result = await resetRecoveredPassword(mobile, code, password, confirmation);
      if (result.success) {
        clearResetFields();
        toast.success(result.message);
        router.replace("/login?reset=success");
        return;
      }

      const receivedAt = Date.now();
      setNow(receivedAt);
      if (result.retryAfter !== undefined) {
        updateDeadlines(mobile, { verifyAt: receivedAt + result.retryAfter * 1000 });
      }
      if (result.needsNewCode || result.fieldErrors?.mobile) {
        setExpiresAt(0);
        clearResetFields();
      }
      setFieldErrors(result.fieldErrors ?? {});
      if (result.needsNewCode || !result.fieldErrors) setError(result.message);
    } catch {
      setError("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.");
    }
    setPending(null);
  }

  const codeValidity = (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2">
      {hasCode ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock3Icon aria-hidden="true" className="size-3.5 shrink-0" />
          <span>اعتبار کد <span className="font-medium tabular-nums text-foreground">{formatDuration(expiresSeconds)}</span></span>
        </p>
      ) : (
        <p role="status" className="text-xs text-muted-foreground">
          اعتبار کد به پایان رسید.
        </p>
      )}
      <Button
        type={hasCode ? "button" : "submit"}
        variant="outline"
        size="sm"
        className="min-h-8 rounded-lg border-border bg-background px-3 shadow-xs disabled:text-muted-foreground disabled:opacity-80"
        disabled={hasCode || resendSeconds > 0 || pending !== null}
      >
        {pending === "send" ? "در حال ارسال کد..." : hasExpiredCode && resendSeconds > 0
          ? `ارسال مجدد پس از ${formatDuration(resendSeconds)}`
          : "ارسال مجدد کد"}
      </Button>
    </div>
  );

  return (
    <main className="flex min-h-dvh items-center justify-center bg-linear-to-b from-(--light-green) via-background to-background px-4 py-6">
      <Card className="w-full max-w-md gap-5 rounded-3xl py-6 shadow-lg shadow-foreground/5">
        <CardHeader className="justify-items-center gap-2 text-center sm:px-7">
          <div className="mb-1 grid size-11 place-items-center rounded-2xl bg-(--light-green) text-green-700 dark:text-green-300">
            <KeyRoundIcon aria-hidden="true" className="size-5" />
          </div>
          <h1 className="text-xl font-bold leading-8">بازیابی رمز عبور</h1>
          {hasCode ? (
            <div className="text-sm leading-6 text-muted-foreground">
              <div className="flex flex-wrap items-center justify-center gap-x-2">
                <p>کد پیامک‌شده به شماره <bdi className="font-medium text-foreground">{mobile}</bdi></p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="px-0 text-green-700 underline dark:text-green-300"
                  disabled={pending !== null}
                  onClick={() => {
                    smsRequest.current?.abort();
                    setExpiresAt(0);
                    clearResetFields();
                    setError("");
                    setFieldErrors({});
                  }}
                >
                  تغییر شماره همراه
                </Button>
              </div>
              <p>کد بازیابی را وارد کنید و رمز جدیدی بسازید.</p>
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              شماره موبایل حساب خود را وارد کنید تا کد بازیابی پیامک شود.
            </p>
          )}
        </CardHeader>
        <CardContent className="sm:px-7">
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            {hasCode ? (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="recovery-code" className="justify-center">کد چهاررقمی بازیابی</Label>
                  <div dir="ltr">
                    <InputOTP
                      ref={codeInput}
                      id="recovery-code"
                      name="code"
                      value={code}
                      onChange={fillCode}
                      pasteTransformer={(value) => toEnglishDigits(value).trim()}
                      pattern="^[0-9۰-۹٠-٩]+$"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={4}
                      required
                      disabled={pending !== null}
                      aria-invalid={Boolean(fieldErrors.code)}
                      aria-describedby={fieldErrors.code ? "recovery-code-error" : undefined}
                      containerClassName="justify-center"
                    >
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            aria-invalid={Boolean(fieldErrors.code)}
                            className="size-12 rounded-lg border bg-background text-lg font-bold data-[active=true]:border-(--base-green) data-[active=true]:ring-(--base-green)/25"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <RecoveryFieldError id="recovery-code-error" message={fieldErrors.code} />
                  {codeValidity}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="recovery-password">رمز عبور جدید</Label>
                  <PasswordInput
                    id="recovery-password"
                    className={fieldClassName}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password}
                    disabled={pending !== null}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "recovery-password-error" : "recovery-password-guidance"}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFieldErrors((errors) => ({ ...errors, password: undefined, confirmation: undefined }));
                    }}
                  />
                  {fieldErrors.password ? (
                    <RecoveryFieldError id="recovery-password-error" message={fieldErrors.password} />
                  ) : (
                    <p id="recovery-password-guidance" className="text-xs text-muted-foreground">حداقل ۸ کاراکتر</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="recovery-confirmation">تکرار رمز عبور جدید</Label>
                  <PasswordInput
                    id="recovery-confirmation"
                    className={fieldClassName}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirmation}
                    disabled={pending !== null}
                    aria-invalid={Boolean(fieldErrors.confirmation)}
                    aria-describedby={fieldErrors.confirmation ? "recovery-confirmation-error" : undefined}
                    onChange={(event) => {
                      setConfirmation(event.target.value);
                      setFieldErrors((errors) => ({ ...errors, confirmation: undefined }));
                    }}
                  />
                  <RecoveryFieldError id="recovery-confirmation-error" message={fieldErrors.confirmation} />
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="recovery-mobile">شماره موبایل</Label>
                <Input
                  id="recovery-mobile"
                  className={`${fieldClassName} tabular-nums`}
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="09123456789"
                  pattern="09[0-9]{9}"
                  required
                  value={mobile}
                  disabled={pending !== null}
                  aria-invalid={Boolean(fieldErrors.mobile)}
                  aria-describedby={fieldErrors.mobile ? "recovery-mobile-error" : undefined}
                  onChange={(event) => {
                    setMobile(toEnglishDigits(event.target.value).trim());
                    setNow(Date.now());
                    setExpiresAt(0);
                    clearResetFields();
                    setError("");
                    setFieldErrors({});
                  }}
                />
                <RecoveryFieldError id="recovery-mobile-error" message={fieldErrors.mobile} />
                {hasExpiredCode && codeValidity}
              </div>
            )}

            {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm leading-6 text-destructive">{error}</p>}

            {!hasExpiredCode && (
              <Button
                type="submit"
                disabled={pending !== null || (hasCode ? verifySeconds > 0 : resendSeconds > 0)}
                className="h-11 w-full rounded-xl bg-green-700 font-bold text-white hover:bg-green-800 dark:bg-green-400 dark:text-green-950 dark:hover:bg-green-300"
              >
                {hasCode
                  ? pending === "reset" ? "در حال ثبت رمز..." : verifySeconds > 0
                    ? `تلاش مجدد پس از ${formatDuration(verifySeconds)}` : "ثبت رمز عبور جدید"
                  : pending === "send" ? "در حال ارسال کد..." : resendSeconds > 0
                    ? `دریافت کد پس از ${formatDuration(resendSeconds)}` : "دریافت کد بازیابی"}
              </Button>
            )}
          </form>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="link" className="text-green-700 dark:text-green-300">
              <Link href="/login">
                <ArrowRightIcon aria-hidden="true" />
                بازگشت به ورود
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

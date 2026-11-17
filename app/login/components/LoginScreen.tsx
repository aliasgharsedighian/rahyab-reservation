"use client";

import { logAnalyticsError } from "@/lib/analytics";
import { beginLoginAttempt, completeLoginAttempt, endAnalyticsSession, failLoginAttempt, type LoginAttempt } from "@/lib/auth-analytics";

import { toEnglishDigits } from "@/lib/digits";
import loginAction from "@/actions/loginAction";
import { useSiteSettings } from "@/app/components/SiteSettingsProvider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logIn, logOut, setToken } from "@/redux/features/auth-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { KeyRoundIcon, ShieldCheckIcon, SmartphoneIcon } from "lucide-react";
import { RulesModal } from "../../components/RulesModal";
import { useRouter } from "next/navigation";
import { clearClientSession } from "@/lib/api/client";
import { getSafeRedirectTo } from "@/lib/api/session";
import { ForgetPasswordModal } from "../../components/ForgetPasswordModal";
import { OtpLoginForm } from "./OtpLoginForm";

const phoneRegex = new RegExp("^(\\+98|09)\\d{9}$");

const signinFormSchema = z.object({
  mobile: z
    .string("شماره موبایل خود را وارد کنید.")
    .transform((value) => toEnglishDigits(value).trim())
    .pipe(
      z
        .string()
        .regex(phoneRegex, "شماره وارد شده صحیح نیست.")
        .min(1, { message: "شماره موبایل خود را وارد کنید." }),
    ),
  password: z.string().min(8, "حداقل ۸ کاراکتر وارد کنید"),
});

function LoginScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const settings = useSiteSettings();
  const onlinePayment = settings.find(({ key }) => key === "PAYMENT_TYPE")?.value === "online";
  const configuredLoginType = settings.find(({ key }) => key === "LOGIN_TYPE")?.value;
  const [loginType, setLoginType] = useState(
    configuredLoginType === "online" || configuredLoginType === "otp" ? "otp" : "password",
  );
  const otpTab = useRef<HTMLButtonElement>(null);
  const submittingPassword = useRef(false);
  const forgotPasswordButton = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [openForgetPasswordModal, setOpenForgetPasswordModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isPendingLogin, setIsPendingLogin] = useState(false);
  const [isPendingOtp, setIsPendingOtp] = useState(false);

  useEffect(() => {
    // This also completes cleanup after a 401 detected during server rendering.
    const reason = new URLSearchParams(window.location.search).get("session");
    if (reason === "expired" || reason === "disabled") endAnalyticsSession(reason);
    clearClientSession();
    dispatch(logOut());
  }, [dispatch]);

  const loginForm = useForm<z.infer<typeof signinFormSchema>>({
    resolver: zodResolver(signinFormSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  });

  const finishLogin = (
    data: { token: string; user: unknown },
    message?: string,
    toastId?: string | number,
    attempt: LoginAttempt | null = null,
    analyticsUserId: string | null = null,
  ) => {
    completeLoginAttempt(attempt, analyticsUserId);
    try {
      localStorage.setItem("token", data.token);
    } catch (storageError) {
      console.warn("Could not persist the login token locally", storageError);
    }

    dispatch(setToken(data.token));
    dispatch(logIn(data.user));
    toast.success(message || "ورود با موفقیت انجام شد.", {
      id: toastId,
    });
    const redirectTo = getSafeRedirectTo(
      new URLSearchParams(window.location.search).get("redirectTo"),
    );
    const defaultRedirect = onlinePayment
      ? "/dashboard/reserve"
      : "/dashboard/reserve?walletGuide=1";
    router.replace(redirectTo ?? defaultRedirect);
  };

  const handleLoginSubmit = async (
    values: z.infer<typeof signinFormSchema>,
  ) => {
    if (submittingPassword.current) return;
    submittingPassword.current = true;
    const attempt = beginLoginAttempt("password");

    setIsPendingLogin(true);
    const toastId = toast.loading("در حال ورود...");

    try {
      const result = await loginAction(values, rememberMe);
      if (!result.success) {
        failLoginAttempt(attempt);
        if (result.errorCode) logAnalyticsError({ eventName: "api_error", operation: "login_with_password" }, result.errorCode);
        toast.error(result.message, { id: toastId });
        return;
      }

      loginForm.reset();
      finishLogin(result.data, result.message, toastId, attempt, result.analyticsUserId);
    } catch (error) {
      failLoginAttempt(attempt);
      console.error("Login failed", error);
      toast.error("ارتباط با سرور برقرار نشد. دوباره تلاش کنید.", {
        id: toastId,
      });
    } finally {
      submittingPassword.current = false;
      setIsPendingLogin(false);
    }
  };

  return (
    <div className="flex min-h-dvh w-full bg-background text-foreground">
      {/* LEFT */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-md text-center px-8">
          <Image
            src="/assets/images/login-picture.jpeg"
            alt="login"
            width={400}
            height={300}
            className="mx-auto mb-6 max-h-[45dvh] w-auto rounded-xl object-contain"
            loading="eager"
          />

          <h1 className="text-2xl font-bold text-foreground mb-3">فودنیکس</h1>

          <p className="text-(--secondary-text) leading-7">
            ساده، سریع و بدون دردسر غذای خود را رزرو کنید
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full items-center justify-center px-3 py-3 md:w-1/2 md:px-6">
        <div className="w-full max-w-md">
          <Card className="gap-3 rounded-2xl border-0 shadow-[0_10px_30px_rgba(0,0,0,0.05)] md:gap-5">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-foreground">
                ورود به فودنیکس
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Tabs dir="rtl" value={loginType} onValueChange={setLoginType} className="gap-3 md:gap-5">
                <TabsList aria-label="روش ورود" className="grid w-full grid-cols-2">
                  <TabsTrigger ref={otpTab} value="otp" disabled={isPendingLogin} className="whitespace-normal leading-tight">
                    <SmartphoneIcon aria-hidden="true" />
                    ورود با کد یکبار مصرف
                  </TabsTrigger>
                  <TabsTrigger value="password" disabled={isPendingOtp} className="whitespace-normal leading-tight">
                    <KeyRoundIcon aria-hidden="true" />
                    ورود با رمز عبور
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="otp" forceMount hidden={loginType !== "otp"}>
                  <OtpLoginForm
                    active={loginType === "otp"}
                    onPendingChange={setIsPendingOtp}
                    onLogin={finishLogin}
                    onShowRules={() => setOpen(true)}
                  />
                </TabsContent>

                <TabsContent value="password">
                  <Form {...loginForm}>
                    <form
                      onSubmit={(event) => void loginForm.handleSubmit(handleLoginSubmit)(event)}
                      className="flex flex-col gap-3"
                    >
                      {/* Mobile */}
                      <FormField
                        control={loginForm.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem className="gap-1.5">
                            <FormLabel className="text-foreground">
                              شماره موبایل
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="مثلاً 09123456789"
                                {...field}
                                inputMode="tel"
                                autoComplete="tel"
                                onChange={(event) =>
                                  field.onChange(
                                    toEnglishDigits(event.target.value),
                                  )
                                }
                                className="h-11 rounded-lg bg-background border border-border focus:border-(--base-green) focus:ring-2 focus:ring-(--light-green) transition"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Password */}
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="gap-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <FormLabel className="text-foreground">رمز عبور</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button type="button" variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs text-(--base-green)">
                                    <ShieldCheckIcon aria-hidden="true" />
                                    راهنمای ورود اولیه
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  dir="rtl"
                                  align="end"
                                  sideOffset={6}
                                  aria-labelledby="initial-login-guide-title"
                                  className="max-w-[calc(100vw-2rem)] p-3 leading-6"
                                >
                                  <p id="initial-login-guide-title" className="font-bold">راهنمای ورود اولیه</p>
                                  <p>برای اولین ورود، شماره موبایلتان را در هر دو فیلد وارد کنید.</p>
                                  <p className="text-muted-foreground">پس از ورود، برای امنیت حساب رمز عبورتان را تغییر دهید.</p>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <FormControl>
                              <PasswordInput
                                placeholder="رمز عبور"
                                {...field}
                                className="h-11 rounded-lg bg-background border border-border focus:border-(--base-green) focus:ring-2 focus:ring-(--light-green) transition"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Options */}
                      <div className="flex justify-between text-sm text-(--secondary-text)">
                        <button
                          ref={forgotPasswordButton}
                          type="button"
                          disabled={isPendingLogin}
                          onClick={() => setOpenForgetPasswordModal(true)}
                          className="text-(--base-green) transition disabled:opacity-50"
                        >
                          <span className="cursor-pointer hover:text-green-600 transition">
                            فراموشی رمز؟
                          </span>
                        </button>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(event) =>
                              setRememberMe(event.target.checked)
                            }
                          />
                          مرا به خاطر بسپار
                        </label>
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        disabled={isPendingLogin}
                        className="h-11 w-full rounded-lg bg-green-500 font-bold text-white transition hover:bg-green-600"
                      >
                        {isPendingLogin ? "در حال ورود..." : "ورود به فودنیکس"}
                      </Button>
                    </form>
                  </Form>
                  <div className="mt-2 text-center text-xs text-(--secondary-text)">
                    <p>ثبت‌نام از طریق سازمان امکان‌پذیر است.</p>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-8 text-xs text-(--base-green)">
                      قوانین و مقررات
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <RulesModal open={open} onOpenChange={setOpen} />
      <ForgetPasswordModal
        open={openForgetPasswordModal}
        onOpenChange={setOpenForgetPasswordModal}
        onSelectOtp={() => {
          setLoginType("otp");
          setOpenForgetPasswordModal(false);
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          (loginType === "otp" ? otpTab : forgotPasswordButton).current?.focus();
        }}
      />
    </div>
  );
}

export default LoginScreen;

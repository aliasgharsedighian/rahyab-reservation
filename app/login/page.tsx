"use client";

import loginAction from "@/actions/loginAction";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { logIn, setToken } from "@/redux/features/auth-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheckIcon, XIcon } from "lucide-react";
import { RulesModal } from "../components/RulesModal";

const phoneRegex = new RegExp("^(\\+98|09)\\d{9}$");

const signinFormSchema = z.object({
  mobile: z
    .string("شماره موبایل خود را وارد کنید.")
    .regex(phoneRegex, "شماره وارد شده صحیح نیست.")
    .min(1, { message: "شماره موبایل خود را وارد کنید." }),
  password: z.string().min(8, "حداقل ۸ کاراکتر وارد کنید"),
});

function LoginPage() {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [isPendingLogin, startTransitionLogin] = useTransition();

  const loginForm = useForm<z.infer<typeof signinFormSchema>>({
    resolver: zodResolver(signinFormSchema),
    defaultValues: {
      mobile: "",
      password: "",
    },
  });

  const handleLoginSubmit = async (
    values: z.infer<typeof signinFormSchema>,
  ) => {
    try {
      startTransitionLogin(async () => {
        const promise = loginAction(values, loginForm);
        toast.promise(promise, {
          loading: "در حال ورود...",
          success: (result) => {
            localStorage.setItem("token", result.data.token);
            dispatch(setToken(result.data.token));
            dispatch(logIn(result.data.user));
            return result.message;
          },
          error: (err) => err.message || "خطایی رخ داد",
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* LEFT */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="max-w-md text-center px-8">
          <Image
            src="/assets/images/login-picture.jpeg"
            alt="login"
            width={400}
            height={300}
            className="mx-auto mb-6 rounded-xl"
            loading="eager"
          />

          <h1 className="text-2xl font-bold text-foreground mb-3">
            سیستم رزرو غذای سازمانی
          </h1>

          <p className="text-(--secondary-text) leading-7">
            ساده، سریع و بدون دردسر غذای خود را رزرو کنید
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-3 md:px-6">
        <div className="w-full max-w-md">
          <Card className="shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-0 rounded-2xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-xl font-bold text-foreground">
                ورود به حساب کاربری
              </CardTitle>
              <p className="text-sm text-(--secondary-text)">
                برای ادامه وارد حساب خود شوید
              </p>
            </CardHeader>

            <CardContent>
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                  className="flex flex-col gap-5"
                >
                  {/* Mobile */}
                  <FormField
                    control={loginForm.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          شماره موبایل
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="مثلاً 09123456789"
                            {...field}
                            className="h-12 rounded-lg bg-background border border-border focus:border-(--base-green) focus:ring-2 focus:ring-(--light-green) transition"
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
                      <FormItem>
                        <FormLabel className="text-foreground">
                          رمز عبور
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="رمز عبور"
                            {...field}
                            className="h-12 rounded-lg bg-background border border-border focus:border-(--base-green) focus:ring-2 focus:ring-(--light-green) transition"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Options */}
                  <div className="flex justify-between text-sm text-(--secondary-text)">
                    <span className="cursor-pointer hover:text-green-600 transition">
                      فراموشی رمز؟
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      مرا به خاطر بسپار
                    </label>
                  </div>

                  {/* Register */}
                  <div className="text-sm text-(--secondary-text) text-center">
                    حساب کاربری ندارید؟{" "}
                    <div
                      // href="/register"
                      className="text-green-600 font-medium hover:text-green-700 transition"
                    >
                      ثبت نام از طریق سازمان امکان پذیر است.
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="text-(--base-green) transition"
                    >
                      مشاهده قوانین و مقررات
                    </button>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isPendingLogin}
                    className="w-full h-12 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition"
                  >
                    {isPendingLogin ? "در حال ورود..." : "ورود به سیستم"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <RulesModal open={open} onOpenChange={setOpen} />
    </div>
  );
}

export default LoginPage;

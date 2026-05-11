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
    <div className="min-h-screen w-full flex bg-gray-50">
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

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            سیستم رزرو غذای سازمانی
          </h1>

          <p className="text-gray-600 leading-7">
            ساده، سریع و بدون دردسر غذای خود را رزرو کنید
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md">
          <Card className="shadow-[0_10px_30px_rgba(0,0,0,0.05)] border-0 rounded-2xl">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-xl font-bold text-gray-800">
                ورود به حساب کاربری
              </CardTitle>
              <p className="text-sm text-gray-500">
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
                        <FormLabel className="text-gray-700">
                          شماره موبایل
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="مثلاً 09123456789"
                            {...field}
                            className="h-12 rounded-lg bg-gray-50 border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
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
                        <FormLabel className="text-gray-700">
                          رمز عبور
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="رمز عبور"
                            {...field}
                            className="h-12 rounded-lg bg-gray-50 border border-gray-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Options */}
                  <div className="flex justify-between text-sm text-gray-500">
                    <span className="cursor-pointer hover:text-green-600 transition">
                      فراموشی رمز؟
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" />
                      مرا به خاطر بسپار
                    </label>
                  </div>

                  {/* Register */}
                  <div className="text-sm text-gray-600 text-center">
                    حساب کاربری ندارید؟{" "}
                    <Link
                      href="/register"
                      className="text-green-600 font-medium hover:text-green-700 transition"
                    >
                      ثبت نام کنید
                    </Link>
                  </div>

                  {/* Terms */}
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="text-gray-500 hover:text-green-600 transition"
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

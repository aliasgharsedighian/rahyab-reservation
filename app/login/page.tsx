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
import { Input } from "@/components/ui/input";
import { setToken } from "@/redux/features/auth-slice";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { z } from "zod";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const phoneRegex = new RegExp("^(\\+98|09)\\d{9}$");

const signinFormSchema = z.object({
  mobile: z
    .string("شماره موبایل خود را وارد کنید.")
    .regex(phoneRegex, "شماره وارد شده صحیح نیست.")
    .min(1, { message: "شماره موبایل خود را وارد کنید." }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function LoginPage() {
  const dispatch = useDispatch();

  const [isPendingLogin, startTransitionLogin] = useTransition();
  const [mobileNumber, setMobileNumber] = useState("");

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
    const copyData = { ...values };
    // console.log(copyData);

    try {
      startTransitionLogin(async () => {
        const promise = loginAction(copyData, loginForm);
        toast.promise(promise, {
          loading: "لطفا کمی صبر کنید",
          success: (result) => {
            // console.log(result);
            localStorage.setItem("token", result.data.token);
            dispatch(setToken(result.data.token));

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
    <div className="min-h-screen w-full mx-auto">
      <div className="flex flex-row w-full">
        <div className="w-full bg-white h-screen flex items-center justify-center">
          <div className="w-full mx-4 sm:mx-8 md:mx-12 lg:mx-16">
            <Card className="w-full py-12">
              <CardHeader>
                <CardTitle>
                  <div className="flex flex-col gap-2 items-center justify-center">
                    <p className="font-bold">خوش آمدید</p>
                    <p>جهت رزرو و عده‌های غذایی خود وارد شوید</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="">
                  {/* logo */}

                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
                      className="flex flex-col gap-6"
                    >
                      <FormField
                        control={loginForm.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>شماره موبایل</FormLabel>
                            <FormControl>
                              <Input
                                id="signin-email"
                                type="text"
                                placeholder="Email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رمز عبور</FormLabel>
                            <FormControl>
                              <Input
                                id="signin-password"
                                type="password"
                                placeholder="Password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        // disabled={signinPending}
                        type="submit"
                        className="w-full"
                      >
                        ورود به سیستم
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="hidden md:flex w-full bg-[#19201e] h-screen">image</div>
      </div>
    </div>
  );
}

export default LoginPage;

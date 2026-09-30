"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";

type Values = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

type Props = {
  open: boolean;
  onPasswordChanged: () => Promise<boolean>;
};

const requiredMessage = "تکمیل این فیلد الزامی است.";

export default function ForcedPasswordChangeModal({
  open,
  onPasswordChanged,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<Values>({
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (values: Values) => {
    setIsSubmitting(true);
    form.clearErrors();
    try {
      const { data: response, status } = await apiClient.post(
        "profile/change-password",
        values,
      );
      const responseStatus = Number(response?.status ?? status);

      if (responseStatus === 422) {
        const errors = (response?.errors ?? response?.data?.errors) as
          | Partial<Record<keyof Values, string | string[]>>
          | undefined;
        if (errors) {
          (Object.keys(errors) as Array<keyof Values>).forEach((field) => {
            const fieldError = errors[field];
            const message = Array.isArray(fieldError)
              ? fieldError[0]
              : fieldError;
            if (message) form.setError(field, { type: "server", message });
          });
        } else {
          toast.error(response?.message || "اطلاعات واردشده معتبر نیست.");
        }
        return;
      }

      if (
        responseStatus < 200 ||
        responseStatus >= 300 ||
        response?.success === false
      ) {
        toast.error(response?.message || "تغییر رمز عبور انجام نشد.");
        return;
      }

      if (!(await onPasswordChanged())) {
        toast.error("تغییر رمز تأیید نشد؛ لطفاً دوباره تلاش کنید.");
        return;
      }

      form.reset();
      toast.success(response?.message || "رمز عبور با موفقیت تغییر کرد.");
    } catch {
      toast.error("خطا در ارتباط با سرور؛ لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-0 sm:max-w-md"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
      >
        <div className="bg-linear-to-l from-(--light-green) to-background px-5 py-6 sm:px-7">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-(--base-green) text-white shadow-sm">
            <ShieldCheck className="size-6" aria-hidden="true" />
          </div>
          <DialogHeader className="text-right">
            <DialogTitle className="iranSansBold text-xl leading-8">
              تغییر رمز عبور الزامی است
            </DialogTitle>
            <DialogDescription className="leading-7 text-(--secondary-text)">
              به‌دلیل مسائل امنیتی، برای ادامه استفاده از سامانه باید رمز عبور
              خود را تغییر دهید. تا زمان ثبت رمز جدید امکان بستن این پنجره وجود
              ندارد.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 px-5 pb-6 sm:px-7"
          >
            <FormField
              control={form.control}
              name="current_password"
              rules={{ required: requiredMessage }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور فعلی</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      placeholder="رمز عبور فعلی را وارد کنید"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              rules={{ required: requiredMessage }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز عبور جدید</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      placeholder="رمز عبور جدید را وارد کنید"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirmation"
              rules={{
                required: requiredMessage,
                validate: (value) =>
                  value === form.getValues("password") ||
                  "تکرار رمز عبور با رمز جدید یکسان نیست.",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تکرار رمز عبور جدید</FormLabel>
                  <FormControl>
                    <PasswordInput
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      placeholder="رمز عبور جدید را دوباره وارد کنید"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="lg"
              className="mt-2 h-11 w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <KeyRound className="size-4" aria-hidden="true" />
              )}
              {isSubmitting ? "در حال بررسی..." : "ثبت رمز عبور جدید"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

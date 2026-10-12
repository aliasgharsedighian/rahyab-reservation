"use client";

import { apiClient } from "@/lib/api/client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { FoodPreferences, ProfileFormValues, ProfileMutationResponse } from "../types";
import type { UseFormReturn } from "react-hook-form";
import { CheckIcon } from "lucide-react";
import { toast } from "sonner";

function IntrestProfile({
  form,
  foodPreferences,
  userFoodPreferences,
}: {
  form: UseFormReturn<ProfileFormValues>;
  foodPreferences: FoodPreferences[];
  userFoodPreferences: FoodPreferences[];
}) {
  const [selectedPreferences, setSelectedPreferences] = useState<number[]>([]);

  useEffect(() => {
    // Keep selections in sync when the server returns refreshed profile data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedPreferences(userFoodPreferences.map((item) => item.id));
  }, [userFoodPreferences]);

  const togglePreference = (id: number) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const onSubmitUpdateProfile = async (values: ProfileFormValues) => {
    const description = values.description;

    const formData = new FormData();

    formData.append("description", description);

    // ارسال آیتم‌های انتخاب شده
    selectedPreferences.forEach((id) => {
      formData.append("food_preferences[]", String(id));
    });

    const { data: response, status } = await apiClient.post<ProfileMutationResponse>(
      "profile",
      formData,
    );

    if (status === 200) {
      await onSubmitUpdateIntrests();
      toast.success(response.message);
    }
  };

  const onSubmitUpdateIntrests = async () => {
    const { data: response, status } = await apiClient.post<ProfileMutationResponse>(
      "profile/food-preferences",
      {
        food_preference_ids: selectedPreferences,
      },
    );

    if (status >= 200 && status < 300) {
      // toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      {/* لیست انتخاب سلیقه غذایی */}
      <div className="space-y-2">
        {/* <h3 className="font-medium">ترجیحات غذایی</h3> */}

        <div className="flex flex-wrap gap-2">
          {foodPreferences.map((item) => {
            const isSelected = selectedPreferences.includes(item.id);

            return (
              <button
                type="button"
                key={item.id}
                onClick={() => togglePreference(item.id)}
                aria-pressed={isSelected}
                className={`inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
                  isSelected
                    ? "border-(--base-green)/25 bg-(--light-green) text-(--base-green)"
                    : "bg-background"
                }`}
              >
                {isSelected && <CheckIcon className="size-3.5 shrink-0" aria-hidden="true" />}
                <span className="break-words">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitUpdateProfile)}
          className="flex flex-1 flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex min-h-28 flex-1 flex-col">
                <FormControl>
                  <Textarea
                    placeholder="علاقه‌مندی‌های خود را بنویسید..."
                    className="min-h-28 flex-1 resize-none rounded-lg bg-muted/50"
                    aria-label="توضیحات علاقه‌مندی‌ها"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-auto h-11 w-full shrink-0 rounded-lg bg-(--base-green) text-white hover:bg-(--base-green)/90 dark:text-zinc-950">
            ثبت علاقه‌مندی‌ها
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default IntrestProfile;

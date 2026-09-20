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
import { FoodPreferences, Profile } from "./ProfileForm";
import { toast } from "sonner";

function IntrestProfile({
  form,
  foodPreferences,
  userFoodPreferences,
}: {
  form: any;
  foodPreferences: FoodPreferences[];
  userFoodPreferences: FoodPreferences[];
}) {
  const [selectedPreferences, setSelectedPreferences] = useState<number[]>([]);

  useEffect(() => {
    setSelectedPreferences(userFoodPreferences.map((item) => item.id));
  }, [userFoodPreferences]);

  const togglePreference = (id: number) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const onSubmitUpdateProfile = async (values: Profile) => {
    const description = values.description;

    const formData = new FormData();

    formData.append("description", description);

    // ارسال آیتم‌های انتخاب شده
    selectedPreferences.forEach((id) => {
      formData.append("food_preferences[]", String(id));
    });

    const { data: response, status } = await apiClient.post(
      "profile",
      formData,
    );

    if (status === 200) {
      await onSubmitUpdateIntrests();
      toast.success(response.message);
    }
  };

  const onSubmitUpdateIntrests = async () => {
    const { data: response, status } = await apiClient.post(
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

  const selectedItems = foodPreferences.filter((item) =>
    selectedPreferences.includes(item.id),
  );

  return (
    <div className="flex flex-col gap-2">
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
                className={`rounded-md border px-3 py-2 text-sm transition ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-background"
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitUpdateProfile)}
          className="space-y-5"
        >
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="علاقه‌مندی‌های خود را بنویسید..."
                    className="min-h-30 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            ثبت علاقه‌مندی‌ها
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default IntrestProfile;

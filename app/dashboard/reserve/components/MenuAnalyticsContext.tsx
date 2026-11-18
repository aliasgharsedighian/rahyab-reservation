"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { logMenuEvent, type MenuEventName, type MenuProperties } from "@/lib/analytics";
import { getAnalyticsIdentity } from "@/lib/auth-analytics";
import type { ReserveFood, ReserveFoodType } from "../types";

const MenuAnalyticsContext = createContext<string | null>(null);

export function MenuAnalyticsProvider({ userId, children }: { userId: string | null; children: ReactNode }) {
  return <MenuAnalyticsContext.Provider value={userId}>{children}</MenuAnalyticsContext.Provider>;
}

export function useMenuAnalytics() {
  const userId = useContext(MenuAnalyticsContext);
  return useCallback((name: MenuEventName, properties: MenuProperties) => {
    logMenuEvent(name, properties, getAnalyticsIdentity(userId));
  }, [userId]);
}

export function getFoodEventProperties(food: Pick<ReserveFood, "food_id" | "price" | "is_reserved" | "max_reservation_quantity" | "food_category">,
  menuDate: string, type: ReserveFoodType): MenuProperties {
  return {
    food_id: `food_${food.food_id}`,
    menu_date: menuDate,
    food_price: food.price,
    availability: food.is_reserved && food.max_reservation_quantity > 0 ? "available" : "unavailable",
    ...(food.food_category ? { food_category: food.food_category } : {}),
    ...(type === "breakfast" || type === "lunch" || type === "dinner" ? { meal_type: type } : {}),
  };
}

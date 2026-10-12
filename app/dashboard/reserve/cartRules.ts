import type { ReserveCartItem, ReserveDay } from "./types";
import { isMainFoodType } from "./types";

// Accept explicit API boolean values, never JavaScript truthiness (e.g. "0").
export function isConfirmedReservation(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function isSideFood(type?: string): boolean {
  return type === "drink" || type === "appetizer";
}

// Match the existing reservation badge, but only for main foods in this day.
export function hasReservedMainFoodForDay(day: ReserveDay): boolean {
  return day.foods.some((group) => isMainFoodType(group.type) &&
    group.items.some((food) => food.reserved_count > 0));
}

export function hasMainFoodForDate(
  items: ReserveCartItem[],
  date: string,
  hasReservedMainFood: unknown = false,
): boolean {
  return isConfirmedReservation(hasReservedMainFood) || items.some(
    (item) => item.date === date && item.count > 0 && isMainFoodType(item.type),
  );
}

export function removeOrphanedSides(items: ReserveCartItem[]): ReserveCartItem[] {
  return items.filter((item) => !isSideFood(item.type) ||
    hasMainFoodForDate(items, item.date, item.reserved_food_day));
}

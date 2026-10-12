import type { ReserveCartItem } from "./types";
import { isMainFoodType } from "./types";

// Accept explicit API boolean values, never JavaScript truthiness (e.g. "0").
export function isConfirmedReservation(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

export function isSideFood(type?: string): boolean {
  return type === "drink" || type === "appetizer";
}

export function hasMainFoodForDate(
  items: ReserveCartItem[],
  date: string,
): boolean {
  // Only a positive main-food quantity in this day's basket unlocks sides.
  // reserved_food_day must never bypass this dependency.
  return items.some(
    (item) => item.date === date && item.count > 0 && isMainFoodType(item.type),
  );
}

export function removeOrphanedSides(items: ReserveCartItem[]): ReserveCartItem[] {
  return items.filter((item) => !isSideFood(item.type) ||
    hasMainFoodForDate(items, item.date));
}

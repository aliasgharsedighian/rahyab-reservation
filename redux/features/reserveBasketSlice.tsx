"use client";

import type { ReserveCartItem } from "@/app/dashboard/reserve/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
import { logOut } from "./auth-slice";
import { hasMainFoodForDate, isSideFood, removeOrphanedSides } from "@/app/dashboard/reserve/cartRules";

// Optional fields support persisted carts from the earlier basket model.
interface ReservationBasketItem extends ReserveCartItem {
  slug?: string;
  countForUser?: number;
  count_for_user?: number;
  item_price?: number;
  shipping_cost?: number;
  firstweight?: number;
}

type InitialState = {
  cart: ReservationBasketItem[];
};

type ReservationBasketState = { reserveBasket: InitialState };

const initialState: InitialState = {
  cart: [],
};

export const reserveBasketSlice = createSlice({
  name: "reserveBasket",
  initialState,
  reducers: {
    addToReserveBasket: (state, action: PayloadAction<ReserveCartItem>) => {
      if (isSideFood(action.payload.type) && !hasMainFoodForDate(
        state.cart, action.payload.date, action.payload.reserved_food_day,
      )) return;
      const itemInCart = state.cart.find(
        (item) => item.id === action.payload.id,
      );
      if (itemInCart) {
        // itemInCart.count++;
        // toast.error(
        //   "آیتم در سبد شما موجود می باشد\n\n برای تغییرات به سبد خرید بروید.",
        // );
        return;
      }
      // else if (state.cart.length > 4) {
      //   toast.error("بیش از 5 آیتم نمی تواند در یک سبد باشد");
      //   return;
      // }
      else {
        // console.log(action.payload);
        state.cart.push({ ...action.payload });
        // toast.success("آیتم به سبد شما اضافه شد.");
      }
      // state.items = [...state.items, action.payload];
    },
    removeFromReserveBasket: (state, action: PayloadAction<Pick<ReserveCartItem, "id">>) => {
      const index = state.cart.findIndex(
        (basketItem) => basketItem.id === action.payload.id,
      );
      let newBasket = [...state.cart];

      if (index >= 0) {
        //the item exist in the basket ... remove it
        newBasket.splice(index, 1);
        newBasket = removeOrphanedSides(newBasket);
        toast.success("آیتم با موفقیت از سبد شما حذف شد.");
      } else {
        console.warn(
          `cant remove product (id: ${action.payload.id} as its not in basket)`,
        );
      }
      state.cart = newBasket;
    },
    incrementReserveCount: (
      state,
      action: PayloadAction<number | string>,
    ) => {
      const item = state.cart.find((item) => item.id === action.payload)!;
      if (!item || (isSideFood(item.type) && !hasMainFoodForDate(
        state.cart, item.date, item.reserved_food_day,
      ))) return;
      item.count++;
    },
    decrementReserveCount: (
      state,
      action: PayloadAction<number | string>,
    ) => {
      const item = state.cart.find((item) => item.id === action.payload)!;
      if (!item) return;
      if (item.count === 0) {
        item.count = 0;
      } else {
        item.count--;
      }
      state.cart = removeOrphanedSides(state.cart.filter((entry) => entry.count > 0));
    },
    updateReserveCount: (state, action: PayloadAction<{ slug: string; count_for_user: number; price: number }>) => {
      const item = state.cart.find(
        (item) => item.slug === action.payload.slug,
      )!;
      item.countForUser = action.payload.count_for_user;
      item.price = action.payload.price;
      if (item.count_for_user! < item.count) {
        item.count = item.count_for_user!;
      }
    },
    // Preserve the existing empty-array action payload for callers.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeAllItemsFromReserve: (state, action: PayloadAction<[]>) => {
      state.cart = [];
    },
    updateReserveCart: (state, action: PayloadAction<ReserveCartItem[]>) => {
      state.cart = removeOrphanedSides(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logOut, (state) => {
      state.cart = [];
    });
  },
});

export const {
  addToReserveBasket,
  removeFromReserveBasket,
  incrementReserveCount,
  decrementReserveCount,
  updateReserveCount,
  removeAllItemsFromReserve,
  updateReserveCart,
} = reserveBasketSlice.actions;

export const reserveSelectItems = (state: ReservationBasketState) => state.reserveBasket.cart;
export const reserveSelectTotalPrice = (state: ReservationBasketState) =>
  state.reserveBasket.cart.reduce(
    (total, item) => total + item.price * item.count,
    0,
  );
export const reserveTotalFoodCount = (state: ReservationBasketState) =>
  state.reserveBasket.cart.reduce(
    (total, item) => total + item.count,
    0,
  );
export const reserveSelectTotalIetmPrice = (state: ReservationBasketState) =>
  state.reserveBasket.cart.reduce(
    (total, item) => total + item.item_price! * item.count,
    0,
  );
export const reserveSelectTotalShoppingCost = (state: ReservationBasketState) =>
  state.reserveBasket.cart.reduce(
    (total, item) => total + item.shipping_cost! * item.count,
    0,
  );
export const reserveSelectTotalWeight = (state: ReservationBasketState) =>
  state.reserveBasket.cart.reduce(
    (total, item) => total + item.firstweight! * item.count,
    0,
  );

export const reserveSelectItemCountById =
  (id: number | string) => (state: ReservationBasketState) => {
    const item = state.reserveBasket.cart.find((item) => item.id === id);

    return item ? item.count : 0;
  };
// export const cartOpen = (state) => state.basket.cartOpen;

export default reserveBasketSlice.reducer;

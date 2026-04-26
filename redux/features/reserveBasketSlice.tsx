"use client";

import { cartType, reserveCartType } from "@/typing";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";

type InitialState = {
  cart: reserveCartType[] | any;
};

const initialState = {
  cart: [],
} as InitialState;

export const reserveBasketSlice = createSlice({
  name: "reserveBasket",
  initialState,
  reducers: {
    addToReserveBasket: (state, action: PayloadAction<any>) => {
      const itemInCart = state.cart.find(
        (item: cartType) => item.id === action.payload.id,
      );
      if (itemInCart) {
        // itemInCart.count++;
        toast.error(
          "آیتم در سبد شما موجود می باشد\n\n برای تغییرات به سبد خرید بروید.",
        );
        return;
      }
      // else if (state.cart.length > 4) {
      //   toast.error("بیش از 5 آیتم نمی تواند در یک سبد باشد");
      //   return;
      // }
      else {
        console.log(action.payload);
        state.cart.push({ ...action.payload });
        toast.success("آیتم به سبد شما اضافه شد.");
      }
      // state.items = [...state.items, action.payload];
    },
    removeFromReserveBasket: (state, action: PayloadAction<any>) => {
      const index = state.cart.findIndex(
        (basketItem: cartType) => basketItem.id === action.payload.id,
      );
      let newBasket = [...state.cart];

      if (index >= 0) {
        //the item exist in the basket ... remove it
        newBasket.splice(index, 1);
        toast.success("آیتم با موفقیت از سبد شما حذف شد.");
      } else {
        console.warn(
          `cant remove product (id: ${action.payload.id} as its not in basket)`,
        );
      }
      state.cart = newBasket;
    },
    incrementReserveCount: (state, action: PayloadAction<cartType>) => {
      const item = state.cart.find((item: any) => item.id === action.payload);
      item.count++;
    },
    decrementReserveCount: (state, action: PayloadAction<cartType>) => {
      const item = state.cart.find((item: any) => item.id === action.payload);
      if (item.count === 1) {
        item.count = 1;
      } else {
        item.count--;
      }
    },
    updateReserveCount: (state, action: PayloadAction<any>) => {
      const item = state.cart.find(
        (item: any) => item.slug === action.payload.slug,
      );
      item.countForUser = action.payload.count_for_user;
      item.price = action.payload.price;
      if (item.count_for_user < item.count) {
        item.count = item.count_for_user;
      }
    },
    removeAllItemsFromReserve: (state, action: PayloadAction<any>) => {
      state.cart = [];
    },
    updateReserveCart: (state, action: any) => {
      state.cart = action.payload;
    },
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

export const reserveSelectItems = (state: any) => state.reserveBasket.cart;
export const reserveSelectTotalPrice = (state: any) =>
  state.reserveBasket.cart.reduce(
    (total: any, item: any) => total + item.price * item.count,
    0,
  );
export const reserveSelectTotalIetmPrice = (state: any) =>
  state.reserveBasket.cart.reduce(
    (total: any, item: any) => total + item.item_price * item.count,
    0,
  );
export const reserveSelectTotalShoppingCost = (state: any) =>
  state.reserveBasket.cart.reduce(
    (total: any, item: any) => total + item.shipping_cost * item.count,
    0,
  );
export const reserveSelectTotalWeight = (state: any) =>
  state.reserveBasket.cart.reduce(
    (total: any, item: any) => total + item.firstweight * item.count,
    0,
  );
// export const cartOpen = (state) => state.basket.cartOpen;

export default reserveBasketSlice.reducer;

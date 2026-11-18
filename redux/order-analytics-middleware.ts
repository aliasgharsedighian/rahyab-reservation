import { isAction, type Middleware } from "@reduxjs/toolkit";
import { trackCartChange } from "@/lib/order-analytics";
import { addToReserveBasket, decrementReserveCount, incrementReserveCount, removeFromReserveBasket,
  updateReserveCount, reserveSelectItems } from "./features/reserveBasketSlice";

const cartChanges = new Set<string>([
  addToReserveBasket.type, decrementReserveCount.type, incrementReserveCount.type,
  removeFromReserveBasket.type, updateReserveCount.type,
]);

export const orderAnalyticsMiddleware: Middleware<object, Parameters<typeof reserveSelectItems>[0]> =
  store => next => action => {
    if (!isAction(action) || !cartChanges.has(action.type)) return next(action);
    const before = reserveSelectItems(store.getState());
    const result = next(action);
    const after = reserveSelectItems(store.getState());
    if (before !== after) trackCartChange(before, after);
    return result;
  };

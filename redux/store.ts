import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/auth-slice";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import storage from "redux-persist/lib/storage";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import reserveReducer from "./features/reserveBasketSlice";

// persist config
const persistConfig = {
  key: "root",
  version: 1,
  storage,
};

// combine reducers
const reducer = combineReducers({
  authReducer,
  reserveBasket: reserveReducer,
});

// only run for real cart actions (not rehydrate, not refresh)
const cartActions = [
  "reserveBasket/addToReserveBasket",
  "reserveBasket/removeFromReserveBasket",
  "reserveBasket/incrementReserveCount",
  "reserveBasket/decrementReserveCount",
  "reserveBasket/updateReserveCount",
  "reserveBasket/removeAllItemsFromReserve",
  "reserveBasket/updateReserveCart",
];

// persist reducer
const persistedReducer = persistReducer(persistConfig, reducer);

// ✅ custom middleware to log cart changes
const cartLogger = (storeAPI: any) => (next: any) => async (action: any) => {
  const result = next(action);

  // only log reserveBasket related actions
  if (cartActions.includes(action.type)) {
    const state = storeAPI.getState();
    const cartState = state.reserveBasket.cart;
    const token = await state.authReducer?.value.token;
    try {
      var myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append("Authorization", `Bearer ${token}`);

      var formdata = new FormData();

      if (cartState.length > 0) {
        for (let i = 0; i < cartState.length; i++) {
          formdata.append(`items[${i}][product_slug]`, cartState[i].slug);
          formdata.append(`items[${i}][quantity]`, cartState[i].count);
          formdata.append(`items[${i}][description]`, cartState[i].description);
        }
      }

      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
      };

      fetch(`${process.env.NEXT_PUBLIC_API_ADDRESS}carts`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
          // console.log(result);
        })
        .catch((error) => console.log(error));
    } catch (error) {
      console.error("Failed to sync cart:", error);
    }
  }

  return result;
};

// store config
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(cartLogger), // add our custom middleware
});

// types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// typed selector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

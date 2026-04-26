import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  value: AuthState;
};

type AuthState = {
  isAuth: boolean;
  token: string;
  userInfo: any;
  userAddress: any;
  productHistorys: [] | any;
};

let initialState = {
  value: {
    isAuth: false,
    token: "",
    userInfo: {},
    userAddress: [],
    productHistorys: [],
  } as AuthState,
} as InitialState;

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logIn: (state, action: PayloadAction<any>) => {
      state.value.userInfo = action.payload;
    },
    setToken: (state, action: PayloadAction<any>) => {
      state.value.token = action.payload;
    },
    getAddress: (state, action: PayloadAction<any>) => {
      state.value.userAddress = action.payload;
    },
    updateWalletBallance: (state, action: PayloadAction<any>) => {
      state.value.userInfo = {
        ...state.value.userInfo,
        wallet_balance: action.payload,
      };
    },
    changeAuth: (state, action: PayloadAction<any>) => {
      state.value.isAuth = action.payload;
    },
    productHistory: (state, action: PayloadAction<any>) => {
      const itemHistory = state.value.productHistorys.find(
        (item: any) => item.asin === action.payload.asin,
      );
      const itemHistoryLength = state.value.productHistorys.length;
      if (!itemHistory) {
        state.value.productHistorys.push({ ...action.payload });
      }
      if (itemHistoryLength > 20) {
        state.value.productHistorys.shift();
      }
    },
    removeProductHistory: (state) => {
      state.value.productHistorys = [];
    },
    logOut: (state) => {
      const productHistorySaved = state.value.productHistorys;
      return (initialState = {
        value: {
          isAuth: false,
          token: "",
          userInfo: {},
          userAddress: [],
          productHistorys: productHistorySaved,
        },
      });
    },
  },
});

export const {
  logIn,
  setToken,
  getAddress,
  logOut,
  changeAuth,
  updateWalletBallance,
  productHistory,
  removeProductHistory,
} = authSlice.actions;
export const userInfoAccess = (state: any) => state.authReducer?.value.userInfo;
export const userAddressAccess = (state: any) =>
  state.authReducer?.value.userAddress;
export const activity = (state: any) => state.authReducer?.value.isAuth;
export const productHistoryData = (state: any) =>
  state?.authReducer.value.productHistorys;
export default authSlice.reducer;
export const token = (state: any) => state?.authReducer.value.token;

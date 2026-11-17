"use client";

import getAuthTokenAction from "@/actions/getAuthTokenAction";
import { logAnalyticsError } from "@/lib/analytics";
import { getApiErrorContext, getTechnicalErrorCode, type ErrorCode, type ErrorEventContext } from "@/lib/analytics-errors";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { getLogoutUrl, getSessionFailure, type SessionFailure } from "./session";

let isRedirectingToLogin = false;

declare module "axios" {
  interface AxiosRequestConfig {
    errorAnalytics?: ErrorEventContext;
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super("The user session is no longer authorized");
    this.name = "UnauthorizedError";
  }
}

export function clearClientSession() {
  try {
    localStorage.removeItem("token");
    // Authentication and user data are stored under the redux-persist root.
    localStorage.removeItem("persist:root");
  } catch (error) {
    console.warn("Could not clear the persisted user session", error);
  }
}

function redirectToLogin(reason: SessionFailure = "expired"): never {
  clearClientSession();

  if (!isRedirectingToLogin) {
    isRedirectingToLogin = true;
    window.location.replace(getLogoutUrl(
      reason,
      window.location.pathname + window.location.search + window.location.hash,
    ));
  }

  throw new UnauthorizedError();
}

async function getAuthToken() {
  let token: string | null = null;

  try {
    token = localStorage.getItem("token");
  } catch (error) {
    console.warn("Could not read the persisted auth token", error);
  }

  if (!token) {
    token = await getAuthTokenAction();
    if (token) {
      try {
        localStorage.setItem("token", token);
      } catch (error) {
        console.warn("Could not persist the auth token", error);
      }
    }
  }

  if (!token) {
    redirectToLogin();
  }

  return token;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ADDRESS,
  headers: {
    Accept: "application/json",
  },
  // Keep the existing API contract: callers inspect the status field returned
  // by the backend for validation and business errors.
  validateStatus: () => true,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAuthToken();
  config.headers.set("Authorization", `Bearer ${token}`);

  return config;
});

function reportApiError(config: AxiosRequestConfig, errorCode: ErrorCode, response?: AxiosResponse) {
  const { errorAnalytics, url, method } = config;
  const context = errorAnalytics ?? getApiErrorContext(url ?? "", method);
  const orderId: unknown = response?.data?.data?.order_id ?? response?.data?.order_id;
  if (context.eventName === "order_error" && context.orderId == null
    && typeof orderId === "number" && Number.isSafeInteger(orderId) && orderId > 0) {
    logAnalyticsError({ ...context, orderId }, errorCode);
    return;
  }
  logAnalyticsError(context, errorCode);
}

apiClient.interceptors.response.use(
  (response) => {
    const failure = getSessionFailure(response.status, response.data);
    if (failure) {
      redirectToLogin(failure);
    }

    const errorCode = getTechnicalErrorCode(response.status, response.data);
    if (errorCode) reportApiError(response.config, errorCode, response);

    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.config && error.code !== "ERR_CANCELED") {
      const response = error.response;
      const failure = response && getSessionFailure(response.status, response.data);
      if (failure) redirectToLogin(failure);

      const errorCode = response
        ? getTechnicalErrorCode(response.status, response.data)
        : error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
          ? "request_timeout"
          : error.request ? "network_error" : undefined;

      if (errorCode) reportApiError(error.config, errorCode, response);
    }

    return Promise.reject(error);
  },
);

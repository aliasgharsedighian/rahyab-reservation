"use client";

import getAuthTokenAction from "@/actions/getAuthTokenAction";
import axios from "axios";

let isRedirectingToLogin = false;

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

function redirectToLogin(): never {
  clearClientSession();

  if (!isRedirectingToLogin) {
    isRedirectingToLogin = true;
    window.location.replace("/auth/logout");
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

apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 401) {
      redirectToLogin();
    }

    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

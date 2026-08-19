"use server";

import loginCookiesAction from "./loginCookiesAction";

interface LoginCredentials {
  mobile: string;
  password: string;
}

type LoginResponse =
  | {
      success: true;
      message: string;
      data: {
        token: string;
        user: unknown;
      };
    }
  | {
      success: false;
      message: string;
    };

export default async function loginAction(
  formData: LoginCredentials,
  rememberMe: boolean,
): Promise<LoginResponse> {
  const myHeaders = new Headers();
  myHeaders.append("Accept", "application/json");
  const myFormdata = new FormData();
  myFormdata.append("mobile", formData.mobile);
  myFormdata.append("password", formData.password);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_ADDRESS}auth/login`,
      {
        method: "POST",
        headers: myHeaders,
        body: myFormdata,
        credentials: "include",
      },
    );
    const result = await response.json();
    if (response.ok && result.status === 200 && result.data?.token) {
      await loginCookiesAction(result.data.token, rememberMe);
      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    }
    return {
      success: false,
      message: result.message || "ورود ناموفق بود.",
    };
  } catch (error) {
    console.error("Login request failed", error);
    return {
      success: false,
      message: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
    };
  }
}

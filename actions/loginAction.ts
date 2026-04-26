import loginCookiesAction from "./loginCookiesAction";

export default async function loginAction(formData: any, loginForm: any) {
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
    // console.log("result");
    if (result.status === 200) {
      loginForm.reset();
      loginCookiesAction(result.data.token, true);
      return result;
    }
  } catch (error) {
    console.log({ error });
    return error;
  }
}

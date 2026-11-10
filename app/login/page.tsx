import { getSiteSettings } from "@/lib/api/site-settings";
import LoginScreen from "./components/LoginScreen";

export default async function LoginPage() {
  const settings = await getSiteSettings();
  const loginType = settings.find(({ key }) => key === "LOGIN_TYPE")?.value;

  return <LoginScreen loginType={loginType === "otp" ? "otp" : "password"} />;
}

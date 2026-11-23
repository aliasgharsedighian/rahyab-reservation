import LoginScreen from "./components/LoginScreen";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { reset } = await searchParams;
  return <LoginScreen preferPassword={reset === "success"} />;
}

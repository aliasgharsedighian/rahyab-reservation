import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./components/DashboardSidebar";
import { AppSidebar } from "./components/app-sidebar";
import { cookies } from "next/headers";
import DashboardHeader from "./components/DashboardHeader";
import DashboardContent from "./components/DashboardContent";
import { NotificationProvider } from "./context/NotificationContext";

export const metadata = {
  title: " رزرو غذا - پیشخوان",
  description: "پیشخوان ",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
    <NotificationProvider>
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="w-full flex flex-col"
      >
        <div className="flex min-h-screen">
          <div className="bg-(--dashboard-background) shadow-lg">
            <DashboardSidebar />
          </div>
          <DashboardContent>
            <main className="min-h-[86dvh] ">{children}</main>
          </DashboardContent>
        </div>
      </SidebarProvider>
    </NotificationProvider>
  );
}

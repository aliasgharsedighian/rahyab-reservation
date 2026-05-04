import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./components/DashboardSidebar";
import { AppSidebar } from "./components/app-sidebar";
import { cookies } from "next/headers";
import DashboardHeader from "./components/DashboardHeader";

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
    <SidebarProvider defaultOpen={defaultOpen} className="w-full flex flex-col">
      <div className="flex min-h-screen">
        <div className="bg-[var(--dashboard-background)] shadow-lg">
          <DashboardSidebar />
        </div>
        <div className="bg-white flex flex-col w-full">
          <main className="min-h-[86dvh]">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

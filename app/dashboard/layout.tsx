import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "./components/DashboardSidebar";
import { AppSidebar } from "./components/app-sidebar";
import { cookies } from "next/headers";

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
      {/* <AppSidebar /> */}
      <main className="bg-[#fafafa] w-full">
        <SidebarTrigger />
        <div className="w-full block md:flex items-start gap-6 max-width mx-auto mb-6 md:my-10">
          <div className="flex bg-white basis-3/12 sticky top-0 md:top-50">
            <DashboardSidebar />
          </div>
          <div className="basis-9/12 w-full! min-h-[40vh] pt-2">{children}</div>
        </div>
      </main>
    </SidebarProvider>
  );
}

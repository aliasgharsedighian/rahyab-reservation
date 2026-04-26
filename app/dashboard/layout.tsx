import DashboardSidebar from "./components/DashboardSidebar";

export const metadata = {
  title: " رزرو غذا - پیشخوان",
  description: "پیشخوان ",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-[#fafafa] w-full">
      <div className="w-full block md:flex items-start gap-6 max-width mx-auto mb-6 md:my-10">
        <div className="flex bg-white basis-3/12 sticky top-0 md:top-50">
          <DashboardSidebar />
        </div>
        <div className="basis-7/12 w-full! min-h-[40vh] pt-2">{children}</div>
        <div className="basis-2/12 w-full">test</div>
      </div>
    </main>
  );
}

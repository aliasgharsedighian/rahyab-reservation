import type { ReactNode } from "react";
import DashboardHeader from "../components/DashboardHeader";

export default function ReserveLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mb-56 flex w-full flex-col gap-6 md:mb-10">
      <DashboardHeader title="رزرو غذا" stickyHeightVariable="--reserve-header-height" />
      {children}
    </div>
  );
}

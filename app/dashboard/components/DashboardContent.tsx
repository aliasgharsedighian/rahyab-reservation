"use client";

import { useSidebar } from "@/components/ui/sidebar";

export default function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { open, isMobile } = useSidebar();

  return (
    <div
      className="bg-background text-foreground flex flex-col transition-all"
      style={{
        width: open && !isMobile ? "calc(100% - var(--sidebar-width))" : "100%",
      }}
    >
      {children}
    </div>
  );
}

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
      className="min-w-0 bg-background text-foreground flex flex-col transition-[width] duration-200"
      style={{
        width: isMobile
          ? "100%"
          : open
            ? "calc(100% - var(--sidebar-width))"
            : "calc(100% - var(--sidebar-width-icon))",
      }}
    >
      {children}
    </div>
  );
}

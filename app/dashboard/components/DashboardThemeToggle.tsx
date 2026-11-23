"use client";

import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function DashboardThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? "default" : "icon"}
      aria-label={showLabel ? undefined : "تغییر حالت روشن یا تیره"}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      <MoonStar className="size-4 dark:hidden" aria-hidden="true" />
      {showLabel && (
        <>
          <span className="dark:hidden">انتخاب حالت تیره</span>
          <span className="hidden dark:inline">انتخاب حالت روشن</span>
        </>
      )}
    </Button>
  );
}

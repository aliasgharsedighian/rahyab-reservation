"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteSetting } from "@/lib/api/site-settings";

const SiteSettingsContext = createContext<SiteSetting[]>([]);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSetting[];
  children: ReactNode;
}) {
  return <SiteSettingsContext value={settings}>{children}</SiteSettingsContext>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}

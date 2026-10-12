"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeToMobileQuery(callback: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}

interface ResponsiveFiltersProps {
  compact?: boolean;
  children: ReactNode;
  activeCount: number;
  onClear: () => void;
  description: string;
}

export default function ResponsiveFilters({
  compact = false,
  children,
  activeCount,
  onClear,
  description,
}: ResponsiveFiltersProps) {
  const isMobile = useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    () => false,
  );
  const [open, setOpen] = useState(false);

  const clearButton = (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-destructive"
      onClick={onClear}
      disabled={activeCount === 0}
    >
      <X className="size-4" />
      حذف همه
    </Button>
  );

  const compactTrigger = (
    <Button type="button" variant="outline" className="h-auto min-h-16 w-full justify-between rounded-xl bg-card px-4 py-3 shadow-sm">
      <span className="flex items-center gap-3 text-right">
        <Filter className="size-5 shrink-0 text-(--base-green)" aria-hidden="true" />
        <span><span className="block text-sm font-bold">فیلتر نتایج</span><span className="mt-1 block text-xs font-normal text-(--secondary-text)">{activeCount > 0 ? activeCount.toLocaleString("fa-IR") + " فیلتر فعال" : "بدون فیلتر"}</span></span>
      </span>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-(--light-green) text-(--base-green)"><SlidersHorizontal className="size-4" aria-hidden="true" /></span>
    </Button>
  );

  if (compact) {
    const Title = isMobile ? DrawerTitle : DialogTitle;
    const Description = isMobile ? DrawerDescription : DialogDescription;
    const Close = isMobile ? DrawerClose : DialogClose;
    const panel = (
      <>
        <header className="flex shrink-0 items-start justify-between gap-2 px-4 pt-5 pb-4 sm:px-5">
          <div className="min-w-0 space-y-1.5 text-right">
            <Title className="flex items-center gap-2 text-lg font-bold">
              <Filter className="size-5 shrink-0 text-(--base-green)" aria-hidden="true" />
              فیلتر نتایج
            </Title>
            <Description className="text-xs leading-6 text-(--secondary-text)">{description}</Description>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {clearButton}
            {!isMobile && <DialogClose asChild><Button variant="ghost" size="icon-sm" aria-label="بستن فیلتر نتایج"><X className="size-4" /></Button></DialogClose>}
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-5">{children}</div>
        <footer className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
          <Close asChild>
            <Button type="button" className="h-11 w-full rounded-lg bg-(--base-green) text-white hover:bg-(--base-green)/90 dark:text-zinc-950">
              مشاهده نتایج{activeCount > 0 && " (" + activeCount.toLocaleString("fa-IR") + " فیلتر)"}
            </Button>
          </Close>
        </footer>
      </>
    );
    return isMobile ? (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{compactTrigger}</DrawerTrigger>
        <DrawerContent dir="rtl" className="data-[vaul-drawer-direction=bottom]:max-h-[88dvh] data-[vaul-drawer-direction=bottom]:rounded-t-3xl">{panel}</DrawerContent>
      </Drawer>
    ) : (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{compactTrigger}</DialogTrigger>
        <DialogContent dir="rtl" showCloseButton={false} className="flex max-h-[88dvh] flex-col gap-0 rounded-2xl p-0 sm:max-w-lg">{panel}</DialogContent>
      </Dialog>
    );
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen} direction="bottom">
        <DrawerTrigger asChild>
          {compact ? compactTrigger : <Button
            type="button"
            variant="outline"
            className="mb-4 h-12 w-full justify-between rounded-xl border-dashed bg-card px-4 shadow-sm"
          >
            <span className="flex items-center gap-2 font-bold">
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <SlidersHorizontal className="size-4" />
              </span>
              فیلتر نتایج
            </span>
            {activeCount > 0 ? (
              <Badge className="min-w-6 justify-center rounded-full">
                {activeCount}
              </Badge>
            ) : (
              <span className="text-xs font-normal text-muted-foreground">
                بدون فیلتر
              </span>
            )}
          </Button>}
        </DrawerTrigger>

        <DrawerContent className="max-h-[88vh] rounded-t-3xl" dir="rtl">
          <DrawerHeader className="border-b px-5 pb-4 pt-3 text-right">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DrawerTitle className="flex items-center gap-2 text-lg font-bold">
                  <Filter className="size-5 text-primary" />
                  فیلتر نتایج
                </DrawerTitle>
                <DrawerDescription className="mt-1.5 text-right">
                  {description}
                </DrawerDescription>
              </div>
              {clearButton}
            </div>
          </DrawerHeader>

          <div className="overflow-y-auto px-5 py-5">{children}</div>

          <DrawerFooter className="border-t bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            <DrawerClose asChild>
              <Button type="button" className="h-11 w-full rounded-xl">
                مشاهده نتایج
                {activeCount > 0 && ` (${activeCount} فیلتر)`}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Card className="mb-6 gap-0 overflow-hidden border-border/70 py-0 shadow-sm">
      <CardHeader className="flex-row items-center justify-between border-b bg-muted/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
            <SlidersHorizontal className="size-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold">فیلتر نتایج</p>
              {activeCount > 0 && (
                <Badge variant="secondary" className="rounded-full">
                  {activeCount} فعال
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {clearButton}
      </CardHeader>
      <CardContent className="px-5 py-5">{children}</CardContent>
    </Card>
  );
}

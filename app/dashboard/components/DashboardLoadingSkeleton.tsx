import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function LoadingBlock({ className }: { className?: string }) {
  return <Skeleton className={cn("motion-reduce:animate-none", className)} />;
}

export function DashboardHeaderSkeleton({ title }: { title: string }) {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-4.5 text-sm shadow-md md:px-6 md:text-base">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <LoadingBlock className="size-8 shrink-0 md:hidden" />
        <h2 className="whitespace-nowrap text-base sm:text-xl">{title}</h2>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-6">
        <LoadingBlock className="size-8 rounded-full" />
        <LoadingBlock className="size-8" />
        <LoadingBlock className="size-5 rounded-full" />
        <div className="hidden space-y-2 sm:block">
          <LoadingBlock className="h-3 w-20" />
          <LoadingBlock className="h-3 w-14" />
        </div>
        <LoadingBlock className="size-9 rounded-full" />
      </div>
    </div>
  );
}

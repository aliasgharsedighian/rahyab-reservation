import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

interface DashboardEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  compact?: boolean;
}

export default function DashboardEmptyState({ icon: Icon, title, description, children, compact = false }: DashboardEmptyStateProps) {
  return (
    <Empty className={cn("gap-6 border border-solid border-border bg-card px-4 py-12 text-card-foreground shadow-sm sm:px-6 sm:py-16", compact && "gap-4 border-0 bg-muted/30 py-8 shadow-none sm:py-10")}>
      <EmptyHeader className="w-full max-w-md gap-3">
        <EmptyMedia variant="icon" className={cn("mb-2 size-20 rounded-3xl border border-(--base-green)/15 bg-(--light-green) text-(--base-green) ring-8 ring-(--light-green)/40", compact && "size-14 rounded-2xl ring-4")}>
          <Icon className={compact ? "size-6" : "size-9"} aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="text-base font-bold sm:text-lg"><h3>{title}</h3></EmptyTitle>
        <EmptyDescription className="max-w-sm text-sm leading-7 text-(--secondary-text)">{description}</EmptyDescription>
      </EmptyHeader>
      {children && <EmptyContent className="max-w-xs">{children}</EmptyContent>}
    </Empty>
  );
}

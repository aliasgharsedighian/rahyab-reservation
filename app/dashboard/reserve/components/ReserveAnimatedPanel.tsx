"use client";

import { useState, type ReactNode } from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import styles from "./FoodReserveTabs.module.css";

// Open and close immediately while releasing hidden cards and subscriptions.
export default function ReserveAnimatedPanel({ defaultOpen, trigger, children, className, contentClassName }: {
  defaultOpen: boolean; trigger: ReactNode; children: ReactNode; className: string; contentClassName: string;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  return <Collapsible open={expanded} onOpenChange={setExpanded} className={className}>
    {trigger}
    <CollapsibleContent forceMount inert={!expanded} hidden={!expanded} className={styles.dayPanel}>
      <div className={contentClassName}>{expanded ? children : null}</div>
    </CollapsibleContent>
  </Collapsible>;
}

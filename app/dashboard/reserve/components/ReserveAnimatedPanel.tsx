"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import styles from "./FoodReserveTabs.module.css";

// Preserve the closing animation, then release hidden cards, images and subscriptions.
export default function ReserveAnimatedPanel({ defaultOpen, trigger, children, className, contentClassName }: {
  defaultOpen: boolean; trigger: ReactNode; children: ReactNode; className: string; contentClassName: string;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const [present, setPresent] = useState(defaultOpen);
  useEffect(() => {
    if (expanded || !present) return;
    const timer = window.setTimeout(() => setPresent(false), 300);
    return () => window.clearTimeout(timer);
  }, [expanded, present]);
  return <Collapsible open={expanded} onOpenChange={(open) => {
    if (open) setPresent(true);
    setExpanded(open);
  }} className={className}>
    {trigger}
    <CollapsibleContent forceMount inert={!expanded} className={styles.dayPanel}>
      <div className={styles.dayContent}>
        <div className="min-h-0 overflow-hidden"><div className={contentClassName}>{present ? children : null}</div></div>
      </div>
    </CollapsibleContent>
  </Collapsible>;
}

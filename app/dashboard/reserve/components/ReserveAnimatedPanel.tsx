"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import styles from "./FoodReserveTabs.module.css";

// Layout changes immediately. Only fade/translate the newly mounted content; no exit delay.
export default function ReserveAnimatedPanel({ defaultOpen, trigger, children, className, contentClassName }: {
  defaultOpen: boolean; trigger: ReactNode; children: ReactNode; className: string; contentClassName: string;
}) {
  const [expanded, setExpanded] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  return <Collapsible open={expanded} onOpenChange={setExpanded} className={className}>
    {trigger}
    <CollapsibleContent forceMount inert={!expanded} hidden={!expanded} className={styles.dayPanel}>
      {expanded ? (
        <motion.div
          className={contentClassName}
          initial={reduceMotion ? false : { opacity: 0, transform: "translateY(4px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.12, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      ) : null}
    </CollapsibleContent>
  </Collapsible>;
}

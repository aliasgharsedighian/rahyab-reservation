"use client";

import { memo, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./FoodReserveTabs.module.css";

// One observer for the whole menu; pre-render well before a batch enters the screen.
const targets = new Map<Element, (near: boolean) => void>();
let observer: IntersectionObserver | undefined;
function observe(element: Element, callback: (near: boolean) => void) {
  if (!("IntersectionObserver" in window)) { callback(true); return () => {}; }
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) targets.get(entry.target)?.(entry.isIntersecting);
  }, { rootMargin: "1400px 0px" });
  targets.set(element, callback);
  observer.observe(element);
  return () => {
    observer?.unobserve(element);
    targets.delete(element);
    if (!targets.size) { observer?.disconnect(); observer = undefined; }
  };
}

function ReserveMenuWindow({ children, count, initial, className }: {
  children: ReactNode; count: number; initial: boolean; className: string;
}) {
  const element = useRef<HTMLDivElement>(null);
  const nearViewport = useRef(initial);
  const previousWidth = useRef(0);
  const [visible, setVisible] = useState(initial);
  const [height, setHeight] = useState<number | undefined>();

  useEffect(() => {
    const node = element.current;
    if (!node) return;
    return observe(node, (near) => {
      nearViewport.current = near;
      // Keep keyboard focus alive even if its card scrolls beyond the window.
      setVisible(near || node.contains(document.activeElement));
    });
  }, []);

  useEffect(() => {
    const node = element.current;
    if (!node || !("ResizeObserver" in window)) return;
    const resize = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (visible) setHeight(entry.contentRect.height);
      else if (previousWidth.current && Math.abs(previousWidth.current - width) > 1) setHeight(undefined);
      previousWidth.current = width;
    });
    resize.observe(node);
    return () => resize.disconnect();
  }, [visible]);

  const style = {
    display: "block",
    "--rows-2": Math.ceil(count / 2), "--rows-3": Math.ceil(count / 3),
    "--rows-4": Math.ceil(count / 4), height: visible ? undefined : height,
  } as CSSProperties;

  return (
    <div ref={element} className={className + " " + styles.menuWindow} style={style}
      data-measured={!visible && height !== undefined ? "true" : undefined}
      onBlur={(event) => {
        if (!nearViewport.current && !event.currentTarget.contains(event.relatedTarget as Node | null)) setVisible(false);
      }}>
      {visible ? children : <div aria-hidden="true" className={styles.menuPlaceholder}>
        {Array.from({ length: count }, (_, index) => <div key={index} className="rounded-xl border bg-zinc-50 p-2 dark:bg-zinc-900">
          <div className="aspect-square rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-4 h-10 rounded bg-(--light-green)" />
        </div>)}
      </div>}
    </div>
  );
}

export default memo(ReserveMenuWindow);

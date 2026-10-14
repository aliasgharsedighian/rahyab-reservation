"use client";

import { useEffect, useEffectEvent, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { logIn } from "@/redux/features/auth-slice";
import { installPwaPullToRefresh, PULL_THRESHOLD } from "@/lib/pwa-pull-to-refresh";
import { useNotifications } from "../context/NotificationContext";

export default function PwaPullToRefresh({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const [distance, setDistance] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { getNotifications } = useNotifications();

  useEffect(() => {
    // Also wait for the RSC payload to commit, not just the client requests.
    busy.current = isPending;
  }, [isPending]);

  const refresh = useEffectEvent(() => {
    if (busy.current) return;
    busy.current = true;
    startTransition(async () => {
      // Refresh Server Components without remounting forms, filters or the cart.
      router.refresh();
      const results = await Promise.allSettled([
        getNotifications(true),
        apiClient.get("profile", { timeout: 15000 }).then(({ data, status }) => {
          if (status !== 200 || data.status !== 200) throw new Error("Profile refresh failed");
          dispatch(logIn(data.data));
        }),
      ]);
      if (results.some((result) => result.status === "rejected")) {
        toast.error("بخشی از اطلاعات به‌روز نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید.");
      }
    });
  });

  useEffect(() => {
    if (!root.current) return;
    return installPwaPullToRefresh(root.current, {
      onProgress: setDistance,
      onRefresh: () => refresh(),
      isRefreshing: () => busy.current,
    });
  }, [pathname]);

  const visible = distance > 0 || isPending;
  const ready = distance >= PULL_THRESHOLD;

  return (
    <div ref={root} className="min-w-0 flex-1">
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        {visible && (
          <div
            className="flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs text-foreground shadow-lg motion-safe:transition-transform"
            style={{ transform: `translateY(${isPending ? 24 : Math.max(0, distance - 24)}px)` }}
          >
            <RefreshCwIcon
              aria-hidden="true"
              className={isPending ? "size-4 text-primary motion-safe:animate-spin" : "size-4 text-primary"}
              style={isPending ? undefined : { transform: `rotate(${distance / PULL_THRESHOLD * 180}deg)` }}
            />
            <span>{isPending ? "در حال به‌روزرسانی…" : ready ? "برای به‌روزرسانی رها کنید" : "برای به‌روزرسانی پایین بکشید"}</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

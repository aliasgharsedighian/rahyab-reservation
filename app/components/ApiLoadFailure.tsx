"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ApiLoadFailure({ message = "دریافت اطلاعات ممکن نشد." }: { message?: string }) {
  const router = useRouter();
  const [isRetrying, startRetry] = useTransition();

  return (
    <div className="flex flex-col items-start gap-3" role="alert">
      <p>{message}</p>
      <Button type="button" variant="outline" disabled={isRetrying}
        onClick={() => startRetry(() => router.refresh())}>
        {isRetrying ? "در حال بارگذاری…" : "تلاش دوباره"}
      </Button>
    </div>
  );
}

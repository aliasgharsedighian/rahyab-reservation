"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center flex-col text-center">
      <h2 className="text-2xl iranSansBold text-red-600">خطای سرور</h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <Button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
      >
        تلاش دوباره
      </Button>
    </div>
  );
}

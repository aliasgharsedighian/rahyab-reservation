"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useReservationFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const clearFilters = () => {
    router.push(`${pathname}?page=1`);
  };

  const updateFilter = (key: string, value: string | null) => {
    console.log(key);
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return {
    searchParams,
    updateFilter,
    clearFilters,
  };
}

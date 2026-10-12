"use client";

import {
  OPEN_WALLET_CHARGE_GUIDE_EVENT,
  type WalletChargeGuideWalletDetail,
} from "@/app/dashboard/components/WalletChargeGuideModal";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function WalletChargeGuideButton() {
  const handleOpenChargeGuide = () => {
    const detail: WalletChargeGuideWalletDetail = { source: "wallet" };
    window.dispatchEvent(
      new CustomEvent(OPEN_WALLET_CHARGE_GUIDE_EVENT, { detail }),
    );
  };

  return (
    <Button type="button" size="icon" aria-label="افزایش اعتبار کیف پول" title="افزایش اعتبار کیف پول" className="size-11 shrink-0 rounded-full bg-(--base-green) text-white hover:bg-(--base-green)/90 dark:text-zinc-950" onClick={handleOpenChargeGuide}>
      <PlusIcon className="size-6" aria-hidden="true" />
    </Button>
  );
}

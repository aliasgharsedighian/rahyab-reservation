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
    <Button className="mt-4 w-full" onClick={handleOpenChargeGuide}>
      <PlusIcon />
      افزایش اعتبار
    </Button>
  );
}

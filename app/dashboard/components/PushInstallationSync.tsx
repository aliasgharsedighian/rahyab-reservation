"use client";

import { useEffect } from "react";
import { observePushInstallation } from "@/lib/push-installation-sync";

export default function PushInstallationSync() {
  useEffect(observePushInstallation, []);
  return null;
}
